# ember-cli-updater

This [ember-cli](https://ember-cli.com/) addon helps you update your ember-cli application or addon.

The idea of this addon is to automate some parts of the upgrade process so it's simplified. Not every change can be automated but there are a bunch that can.

__Current features__

* Updates you package.json keeping your customizations

__Planned features__

* Automate other file upgrades
  * .npmignore
  * .gitignore
  * ember-try configuration
* List available versions of ember-cli

## Synopsis

This command would update your current application/addon's package.json file from its current version (read from the package.json) to ember-cli v2.14.0.

```
$ ember update v2.14.0
```

## Installation

```
$ ember install ember-cli-updater
```

## License

ember-cli-updater is licensed under the MIT license.

See [LICENSE](./LICENSE) for the full license text.
