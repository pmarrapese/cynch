"use strict";

const _ = require('lodash');
const process = require('process');

class App {
  constructor() {
    global.App = this;

    try {
      this._parseArguments();
      this._configure();
      this.run();
    } catch (e) {
      this.die(e.stack || e.message || e);
    }
  }

  _parseArguments() {
    this.args = require('yargs')
      .usage('Usage: cynch [OPTIONS] [CONFIG FILE]')
      .help('help').alias('?', 'help')
      .version(() => {
        let pkg = require('../package.json');
        return `Cynch ${pkg.version}\nWritten by ${pkg.author.name} <${pkg.author.email}>\n${pkg.homepage}`;
      }).alias('v', 'version')
      .argv;

    this.configPath = process.argv.length >= 3 ? process.argv[process.argv.length - 1] : '';  // this is always the last argument
  }

  _configure() {
    this.config = new (require('./Config'))(this.configPath);

    if (this.config.growl) {
      this.growler = require('./Growler');
    }

    if (this.config.watch) {
      this.watcher = new (require('./Watcher'))();
    }

    this.syncer = new (require('./Syncer'))();
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