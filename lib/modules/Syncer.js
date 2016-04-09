"use strict";

const CynchModule = require('../CynchModule');
const Rsync = require('rsync');
const _ = require('lodash');

class Syncer extends CynchModule {
  constructor() {
    super();
    this.registerEvents();
  }

  /**
   * Listen for sync events.
   */
  registerEvents() {
    this.on('sync', this.onSync);
  }

  /**
   * Handle sync events.
   */
  onSync() {
    this.sync();
  }
  
  sync() {
    let pending = App.config.targets.length;

    App.log(`Uploading to ${pending} target(s)...`);

    for (let target of App.config.targets) {
      let rsync = new Rsync()
        .recursive()
        .compress()
        .include(App.config.inclusions)  // inclusions must come before exclusions!
        .exclude(App.config.exclusions)
        .source(App.config.source)
        .destination(`${target.host}:${target.path}`);

      _.each(App.config.rsyncOptions, (option) => {
        if (_.isArray(option)) {
          rsync.set.apply(rsync, option);
        } else {
          rsync.set(option);
        }
      });

      // Attach handlers to the process directly [instead of through execute()] so we can reference the PID
      let stdoutHandler = (data) => {
        App.debug(`[${proc.pid}] [stdout]`, data.toString().trim());
      };

      let stderrHandler = (data) => {
        App.log(`[${proc.pid}] [stderr]`, data.toString().trim());
        App.trigger('growl', 'Cynch $PROJ_NAME Error', data.toString().trim());
      };

      let closeHandler = (code) => {
        let call = (code ? App.log : App.debug).bind(App);
        call(`[${proc.pid}] [close] code ${code}`);

        if (--pending == 0) {
          App.log('Sync complete.');
          App.trigger('growl', 'Cynch $PROJ_NAME Success', `Uploaded ${App.config.targets.length} Targets`);
        }
      };

      let proc = rsync.execute();
      proc.stdout.on('data', stdoutHandler);
      proc.stderr.on('data', stderrHandler);
      proc.on('close', closeHandler);

      App.debug(`Spawned: ${rsync.command()} [pid ${proc.pid}]`);
    }

    App.debug('Spawn complete.');
  }
}

module.exports = Syncer;
