/* eslint-env node */
'use strict';

module.exports = {
  migrate: migrate
}

function migrate(fromTag, toTag, packageJSON, isAddon) {
  var RSVP = require("rsvp");

  return RSVP.hash({
    from: fetchRawPackageJSON(fromTag, isAddon),
    to: fetchRawPackageJSON(toTag, isAddon),
  }).then(function(result) {

    // console.log("package.json " + fromTag);
    // console.log("--------------------------");
    // console.log(JSON.stringify(result.from, null, 2));
    // console.log("\n");
    // console.log("package.json " + toTag);
    // console.log("--------------------------");
    // console.log(JSON.stringify(result.to, null, 2));
    // console.log("\n");

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

function fetchRawPackageJSON(tag, isAddon) {
  var fetch = require("node-fetch");
  var packageJSONURL;

  if (isAddon) {
    packageJSONURL = "https://raw.githubusercontent.com/ember-cli/ember-addon-output/" + tag + "/package.json";
  } else {
    packageJSONURL = "https://raw.githubusercontent.com/ember-cli/ember-new-output/" + tag + "/package.json";
  }

  return fetch(packageJSONURL)
    .then(function(response) {
      return response.json();
    });
}
