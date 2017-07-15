var applyChange = require("deep-diff").applyChange;
var diff = require("deep-diff").diff;

module.exports = {
  value,
  valueFor,
  calculate: diff,
  apply: apply,
  applyAll: applyAll,
  key: key,
};

function value(change) {
  return change.rhs;
}

function valueFor(target, change) {
  return change.path.reduce(function(acc, path) {
    if (acc) {
      return acc[path];
    }
  }, target);
}

function key(change) {
  return change.path.slice(-1);
}

function apply(target, change) {
  applyChange(target, {}, change);
}

function applyAll(target, changes) {
  changes.forEach(function(change) {
    apply(target, change);
  });

  return target;
}
