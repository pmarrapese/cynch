"use strict";

const CynchModule = require('../CynchModule');
const path = require('path');
const watcher = require('chokidar');
const _ = require('lodash');

class Watcher extends CynchModule {
  constructor() {
    super();
    this.watch();
  }
  
  watch() {
    let dir = App.config.watchOptions.path || path.dirname(App.config.source);
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

      // Wait before syncing to aggregate changes
      timer = setTimeout(App.trigger.bind(App, 'sync'), App.config.watchOptions.waitTimeout);
    });
  }
}

module.exports = Watcher;