/* eslint-env node */
'use strict';

module.exports = {
  migrate: migrate
}

function migrate(fromTag, toTag, packageJSON) {
  var RSVP = require("rsvp");

  return RSVP.hash({
    from: fetchRawPackageJSON(fromTag),
    to: fetchRawPackageJSON(toTag),
  }).then(function(result) {

    console.log("package.json " + fromTag);
    console.log("--------------------------");
    console.log(JSON.stringify(result.from, null, 2));
    console.log("\n");
    console.log("package.json " + toTag);
    console.log("--------------------------");
    console.log(JSON.stringify(result.to, null, 2));
    console.log("\n");

    return update(result.from, packageJSON, result.to);
  });
}

function update(from, mine, to) {
  var tmp = diff(from, mine);

  return patch(to, tmp);
}

function diff(original, mine) {
  var doDiff = require("deep-diff").diff;

  return doDiff(original, mine);
}

function patch(target, diff) {
  var deepAssign = require('deep-assign');
  var apply = require("deep-diff").applyChange;
  var copy = deepAssign({}, target);

  diff.forEach(function(change) {
    apply(copy, {}, change);
  });

  console.log("Done.\n");

  return copy;
}

function fetchRawPackageJSON(tag) {
  var fetch = require("node-fetch");

  return fetch("https://raw.githubusercontent.com/ember-cli/ember-new-output/" + tag + "/package.json")
    .then(function(response) {
      return response.json();
    });
}
