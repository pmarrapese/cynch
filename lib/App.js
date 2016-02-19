"use strict";

const _ = require('lodash');
const process = require('process');

class App {
  constructor() {
    global.App = this;

    const Config = require('./Config');
    const Syncer = require('./Syncer');
    const Watcher = require('./Watcher');
    const Growler = require('./Growler');

    let path = process.argv.length >= 3 ? process.argv[2] : '';

    try {
      this.config = new Config(path);
      this.syncer = new Syncer();
      this.watcher = new Watcher();
      this.growler = new Growler();

      this.run();
    } catch (e) {
      this.die(e.stack || e.message || e);
    }
  }

  run() {
    if (this.config.watch) {
      this.watcher.watch();
    } else {
      this.syncer.sync();
    }
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
    if (!this.config || !this.config.debug) {
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
    let time = new Date().toTimeString().split(' ', 1)[0];
    args.unshift(`[${time}]`);
    console.log.apply(this, args);
  }
}

new App();