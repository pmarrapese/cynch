"use strict";

const Config = require('./Config');
const Rsync = require('rsync');
const co = require('co');
const _ = require('lodash');
const process = require('process');
const path = require('path');
const watcher = require('chokidar');
const bind = require('co-bind');

const START_TIME = new Date().getTime();

new (class {
  constructor() {
    co(function*() {
      let path = process.argv.length >= 3 ? process.argv[2] : '';
      this.config = yield (new Config(path)).load();

      yield this.sync();
      if (this.config.watch) {
        yield this.watch();
      }
    }.bind(this)).catch((e) => { this.die(e.stack || e.message || e) });
  }


  *sync() {
    this.log(`Uploading to ${this.config.targets.length} target(s)...`);

    let pending = this.config.targets.length;

    for (let target of this.config.targets) {
      let rsync = new Rsync()
        .recursive()
        .compress()
        .include(this.config.inclusions)  // inclusions must come before exclusions!
        .exclude(this.config.exclusions)
        .source(this.config.source)
        .destination(`${target.host}:${target.path}`);

      _.each(this.config.rsyncOptions, (option) => {
        if (_.isArray(option)) {
          rsync.set.apply(rsync, option);
        } else {
          rsync.set(option);
        }
      });

      // Attach handlers to the process directly [instead of through execute()] so we can reference the PID
      let stdoutHandler = (data) => {
        this.debug(`[${proc.pid}] [stdout]`, data.toString().trim());
      };

      let stderrHandler = (data) => {
        this.die(`[${proc.pid}] [stderr]`, data.toString().trim());
      };

      let closeHandler = (code) => {
        let call = (code ? this.die : this.debug).bind(this);
        call(`[${proc.pid}] [close] code ${code}`);

        if (--pending == 0) {
          this.log('Sync complete.');
        }
      };

      let proc = rsync.execute();
      proc.stdout.on('data', stdoutHandler);
      proc.stderr.on('data', stderrHandler);
      proc.on('close', closeHandler);

      this.debug(`Spawned: ${rsync.command()} [pid ${proc.pid}]`);
    }

    this.debug('Spawn complete.');
  }

  /**
   * @param {...*=}
   */
  die() {
    let args = _.map(arguments, argument => argument);
    args.unshift('[FATAL ERROR]');
    this.log.apply(this, args);
    process.exit(1);
  }

  /**
   * @param {...*=}
   */
  debug() {
    if (!this.config.debug) {
      return;
    }

    let args = _.map(arguments, argument => argument);
    args.unshift('[DEBUG]');
    this.log.apply(this, args);
  }

  /**
   * @param {...*=}
   */
  log() {
    let args = _.map(arguments, argument => argument);
    let time = ((new Date().getTime() - START_TIME) / 1000).toFixed(3).toString() + 's';
    args.unshift(`[${time}]`);
    console.log.apply(this, args);
  }
})();