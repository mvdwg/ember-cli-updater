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

    if (!/^v/.test(toTag)) {
      toTag = 'v' + toTag;
    }

    var packageJSONPath = path.join(this.project.root, 'package.json');
    var packageJSON = require(packageJSONPath);
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
    var fs = require('fs');

    return migrate(fromTag, toTag, packageJSON, isAddon, this.ui).then(function(obj) {
      var sortedPackageJSON = JSON.stringify(sort(obj), null, 2);

      console.log("\n");
      console.log(chalk.green("Writing package.json"));

      fs.writeFileSync(
        packageJSONPath,
        sortedPackageJSON,
        'utf8'
      );

      console.log("Done.\n");

      console.log("Now that you have an updated package.json the next steps in updating your app/addon are");
      console.log("1. Delete your node_modules/ and bower_component/ folders");
      console.log("2. Install dependencies `yarn install` or `npm install`");
      console.log("3. Run `ember init`, remember to skip overwriting the package.json (already updated)");
      console.log("");
      console.log("That's it!");
    });
  }
});
