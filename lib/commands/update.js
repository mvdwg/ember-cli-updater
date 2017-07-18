/* eslint-env node */
'use strict';

var Command = require('ember-cli/lib/models/command');
var fs = require('fs');
var execa = require('execa');
var RSVP = require('rsvp');

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

    if (!/^v/.test(toTag)) {
      toTag = 'v' + toTag;
    }

    var packageJSONPath = path.join(this.project.root, 'package.json');
    var packageJSON = require(packageJSONPath);
    var yarnLockPath = path.join(this.project.root, 'yarn.lock');
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

    /**
     * Note that ember-cli sorts package.json using the rules from
     * `sort-package-json` lib. By sorting the output we minimize the number of
     * changes in the diff :D
     */
    var sort = require('sort-package-json');

    return migrate(fromTag, toTag, packageJSON, isAddon, this.ui).then(function(obj) {
      var sortedPackageJSON = JSON.stringify(sort(obj), null, 2);

      console.log(chalk.dim(sortedPackageJSON));
      console.log("\n");

      fs.writeFileSync(
        packageJSONPath,
        sortedPackageJSON,
        'utf8'
      );

      if (fs.existsSync(yarnLockPath)) {
        console.log(chalk.green("Running yarn install..."));

        return RSVP.resolve(execa('yarn'));
      } else {
        console.log(chalk.green("Running npm install..."));

        return RSVP.resolve(execa('npm', ['install']));
      }
    }).catch(function(error) {
      console.error(error);
    });
  }
});
