/* eslint-env node */
'use strict';

module.exports = {
  name: 'ember-cli-updater',

  includedCommands: function() {
    return require('./lib/commands');
  }
};
