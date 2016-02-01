"use strict";

const path = require('path');
const watcher = require('chokidar');
const _ = require('lodash');

class Watcher {
  watch() {
    let dir = path.dirname(App.config.source);
    App.log('Watching files in directory', dir);

    let timer;

    let options = _.defaults(App.config.watchOptions, {
      persistent: true,
      cwd: dir,
      ignoreInitial: true,
      ignored: App.config.exclusions
    });

    watcher.watch(dir, options).on('all', (event, path) => {
      App.debug(event, path);
      if (timer) {
        clearTimeout(timer);
      }

      // Wait 500ms before syncing, to aggregate changes
      timer = setTimeout(App.syncer.sync, App.config.watchOptions.waitTimeout);
    });
  }
}

module.exports = Watcher;