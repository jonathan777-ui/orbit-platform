// validate.js — a small, dependency-free JSON-Schema-style validator.
//
// We deliberately do NOT pull in ajv or any npm package (the zero-dependency
// constraint). This validator supports the subset of JSON Schema draft-07 that
// site.schema.json actually uses: type, required, enum, const, minLength,
// minItems, additionalProperties:false, $ref/definitions, oneOf (used as a
// discriminated union on `type`), and items.
//
// validateSite(site) -> { valid: boolean, errors: string[] }

'use strict';

const fs = require('fs');
const path = require('path');

const SCHEMA_PATH = path.join(__dirname, '..', 'schema', 'site.schema.json');

let _schema = null;
function loadSchema() {
  if (!_schema) {
    _schema = JSON.parse(fs.readFileSync(SCHEMA_PATH, 'utf8'));
  }
  return _schema;
}

// Resolve a local "#/definitions/Foo" $ref against the root schema.
function resolveRef(root, ref) {
  if (!ref.startsWith('#/')) {
    throw new Error('Only local refs are supported: ' + ref);
  }
  const parts = ref.slice(2).split('/');
  let node = root;
  for (const p of parts) {
    node = node[p];
    if (node === undefined) throw new Error('Unresolvable ref: ' + ref);
  }
  return node;
}

function typeOf(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value; // 'object' | 'string' | 'number' | 'boolean'
}

function matchesType(value, expected) {
  switch (expected) {
    case 'object':
      return value !== null && typeof value === 'object' && !Array.isArray(value);
    case 'array':
      return Array.isArray(value);
    case 'string':
      return typeof value === 'string';
    case 'number':
      return typeof value === 'number';
    case 'integer':
      return typeof value === 'number' && Number.isInteger(value);
    case 'boolean':
      return typeof value === 'boolean';
    case 'null':
      return value === null;
    default:
      return false;
  }
}

// Core recursive validator. `errors` accumulates human-readable messages
// prefixed by their JSON path (e.g. "site.pages[0].content[2].headline").
function validateNode(value, schema, root, pathStr, errors) {
  // $ref indirection.
  if (schema.$ref) {
    return validateNode(value, resolveRef(root, schema.$ref), root, pathStr, errors);
  }

  // oneOf — used as a discriminated union keyed on the `type` field.
  if (schema.oneOf) {
    return validateOneOf(value, schema, root, pathStr, errors);
  }

  // const.
  if (Object.prototype.hasOwnProperty.call(schema, 'const')) {
    if (value !== schema.const) {
      errors.push(`${pathStr}: expected const "${schema.const}", got "${value}"`);
    }
    return;
  }

  // type.
  if (schema.type && !matchesType(value, schema.type)) {
    errors.push(`${pathStr}: expected type "${schema.type}", got "${typeOf(value)}"`);
    return; // further checks assume the right type
  }

  // enum.
  if (schema.enum && !schema.enum.includes(value)) {
    errors.push(`${pathStr}: "${value}" is not one of [${schema.enum.join(', ')}]`);
  }

  // string constraints.
  if (schema.type === 'string' && typeof value === 'string') {
    if (typeof schema.minLength === 'number' && value.length < schema.minLength) {
      errors.push(`${pathStr}: string shorter than minLength ${schema.minLength}`);
    }
  }

  // array constraints.
  if (schema.type === 'array' && Array.isArray(value)) {
    if (typeof schema.minItems === 'number' && value.length < schema.minItems) {
      errors.push(`${pathStr}: array has ${value.length} items, minItems ${schema.minItems}`);
    }
    if (schema.items) {
      value.forEach((item, i) => {
        validateNode(item, schema.items, root, `${pathStr}[${i}]`, errors);
      });
    }
  }

  // object constraints.
  if (schema.type === 'object' && matchesType(value, 'object')) {
    const props = schema.properties || {};

    if (Array.isArray(schema.required)) {
      for (const key of schema.required) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) {
          errors.push(`${pathStr}: missing required property "${key}"`);
        }
      }
    }

    if (schema.additionalProperties === false) {
      for (const key of Object.keys(value)) {
        if (!Object.prototype.hasOwnProperty.call(props, key)) {
          errors.push(`${pathStr}: additional property "${key}" is not allowed`);
        }
      }
    }

    for (const [key, subSchema] of Object.entries(props)) {
      if (Object.prototype.hasOwnProperty.call(value, key)) {
        validateNode(value[key], subSchema, root, pathStr ? `${pathStr}.${key}` : key, errors);
      }
    }
  }
}

// Discriminated-union handling: pick the oneOf branch whose `type.const`
// matches the value's `type`, then validate against just that branch so the
// error messages are specific instead of "failed all 7 alternatives".
function validateOneOf(value, schema, root, pathStr, errors) {
  const isObj = matchesType(value, 'object');
  const disc = schema.discriminator; // e.g. "type"

  if (isObj && disc && typeof value[disc] === 'string') {
    for (const branchRef of schema.oneOf) {
      const branch = branchRef.$ref ? resolveRef(root, branchRef.$ref) : branchRef;
      const constVal =
        branch.properties && branch.properties[disc] && branch.properties[disc].const;
      if (constVal === value[disc]) {
        return validateNode(value, branch, root, pathStr, errors);
      }
    }
    errors.push(`${pathStr}: unknown ${disc} "${value[disc]}"`);
    return;
  }

  // No discriminator match possible: try each branch, accept if exactly one
  // passes; otherwise report that none matched.
  let passes = 0;
  let firstErrors = null;
  for (const branchRef of schema.oneOf) {
    const branch = branchRef.$ref ? resolveRef(root, branchRef.$ref) : branchRef;
    const branchErrors = [];
    validateNode(value, branch, root, pathStr, branchErrors);
    if (branchErrors.length === 0) passes++;
    else if (!firstErrors) firstErrors = branchErrors;
  }
  if (passes !== 1) {
    errors.push(`${pathStr}: did not match exactly one schema (matched ${passes})`);
    if (firstErrors) errors.push(...firstErrors);
  }
}

/** Validate a site object against site.schema.json. */
function validateSite(site) {
  const schema = loadSchema();
  const errors = [];
  try {
    validateNode(site, schema, schema, '', errors);
  } catch (e) {
    errors.push('validator error: ' + e.message);
  }
  return { valid: errors.length === 0, errors };
}

module.exports = { validateSite, loadSchema };
