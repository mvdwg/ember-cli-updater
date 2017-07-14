/* eslint-env node */
'use strict';

var Command = require('ember-cli/lib/models/command');

function cleanupVersion(rawVersion) {
  return 'v' + rawVersion.replace(/[~^]/, '');
}

module.exports = Command.extend({
  name: 'update',
  description: 'Update your ember-cli package.json from current version to the specified version',
  works: 'insideProject',

  run: function(commandOptions, rawArgs) {
    var path = require('path');
    var toTag = rawArgs.shift();

    var packageJSON = require(path.join(this.project.root, 'package.json'));
    var fromTag = cleanupVersion(packageJSON.devDependencies['ember-cli']);
    var migrate = require('../updater').migrate;

    console.log('Updating package.json from version ' + fromTag + ' to version ' + toTag);
    console.log('');

    return migrate(fromTag, toTag, packageJSON).then(function(obj) {
      console.log("RESULT");
      console.log("--------------------------");
      console.log(JSON.stringify(obj, null, 2));
      console.log("\n");
    });
  }
});
