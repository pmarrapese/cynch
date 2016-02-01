"use strict";

class Watcher {
  *watch() {
    let dir = path.dirname(this.config.source);
    this.log('Watching files in directory', dir);

    let timer;

    let options = _.defaults(this.config.watchOptions, {
      persistent: true,
      cwd: dir,
      ignoreInitial: true
    });

    watcher.watch(dir, options).on('all', (event, path) => {
      this.debug(event, path);
      if (timer) {
        clearTimeout(timer);
      }

      // Wait 500ms before syncing, to aggregate changes
      timer = setTimeout(co.wrap(bind(this.sync, this)), 500);
    });
  }
}

module.exports = Watcher;