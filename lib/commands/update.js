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

    if (!toTag) {
      this.ui.writeError('Usage: ember update <ember-cli version>');
      return;
    }

    var packageJSON = require(path.join(this.project.root, 'package.json'));
    var fromTag = cleanupVersion(packageJSON.devDependencies['ember-cli']);
    var isAddon = this.project.isEmberCLIAddon();
    var migrate = require('../updater').migrate;

    console.log('');
    require('../banner')(console.log);
    console.log('');

    var chalk = require('chalk');

    console.log('      Updating package.json');
    console.log('          from ' + chalk.bold(fromTag));
    console.log('            to ' + chalk.bold(toTag));
    console.log('');

    return migrate(fromTag, toTag, packageJSON, isAddon, this.ui).then(function(obj) {
      console.log(chalk.dim(JSON.stringify(obj, null, 2)));
      console.log("\n");
    }).catch(function(error) {
      console.error(error);
    });
  }
});
