/* eslint-env node */
'use strict';

module.exports = {
  migrate: migrate
}

var RSVP = require("rsvp");
var chalk = require("chalk");
var deepAssign = require('deep-assign');

var Task = require("./task");
var Change = require("./change");

function migrate(fromTag, toTag, packageJSON, isAddon, ui) {
  var context = {
    fromTag: fromTag,
    toTag: toTag,
    isAddon: isAddon
  };
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

    return update(result.from, packageJSON, result.to, ui, context);
  });
}

function update(from, mine, to, ui, context) {
  var changes = Change.calculate(from, mine);

  return patch(to, changes, ui, context);
}

function patch(target, changes, ui, context) {
  var tasks = changes.map(function(change) {
    // Should we delete the dependency?
    if (isDeletedDependency(change, target)) {
      return questionTask(
        ui,
        deletedDependencyQuestion(Change.key(change), Change.value(change), Change.valueFor(target, change), context),
        returnIfFalse(change)
      );
    }

    // Should we update the dependency?
    if (isDirtyDependency(change)) {
      return questionTask(
        ui,
        dirtyDependencyQuestion(Change.key(change), Change.value(change), Change.valueFor(target, change), context),
        returnIfFalse(change)
      );
    }

    // Don't ask, just apply the change
    return Task.fromValue(change);
  });

  return Task.runInSeries(tasks)
    .then(function(changes) {
      return changes.filter(Boolean);
    })
    .then(function(changes) {
      return Change.applyAll(deepAssign({}, target), changes);
    });
}

function isDeletedDependency(change, target) {
  return isDirtyDependency(change) && !Change.valueFor(target, change);
}

function isDirtyDependency(change) {
  return change.kind === "E" && change.path[0] === "devDependencies";
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

function questionTask(ui, message, callback) {
  return Task.lazy(function() {
    return ui.prompt([{
      type: "confirm",
      name: "update",
      message: message
    }]).then(function(answers) {
      console.log("");
      return callback(answers.update);
    });
  });
}

function returnIfFalse(value) {
  return function(condition) {
    if (!condition) {
      return value;
    }
  }
}

function deletedDependencyQuestion(packageName, version, context) {
  return [
    "Oops, it seems that " + chalk.red(packageName) + " was changed by hand but it's not included in ember-cli anymore.",
    "  ",
    '  ' + chalk.yellow(version) + ' (in your project)',
    "  ",
    "  Do you want to remove it?",
  ].join("\n");
}

function dirtyDependencyQuestion(packageName, from, to, context) {
  return [
    "Oops, it seems that " + chalk.green(packageName) + " was changed by hand.",
    "  ",
    '  ' + chalk.green(to) + ' (in ember-cli ' + context.toTag + ')',
    '  ' + chalk.yellow(from) + ' (in your project)',
    "  ",
    "  Do you want to use the " + chalk.green(to) + " version?",
  ].join("\n");
}
