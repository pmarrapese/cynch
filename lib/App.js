"use strict";

const _ = require('lodash');
const process = require('process');
const Config = require('./Config');

class App {
  constructor() {
    global.App = this;

    try {
      this.initialize();
      this.run();
    } catch (e) {
      this.die(e.stack || e.message || e);
    }
  }

  initialize() {
    // Parse arguments.
    this.args = require('yargs')
      .usage('Usage: cynch [OPTIONS] [CONFIG FILE]')
      .help('help').alias('?', 'help')
      .version(this.getAuthorString).alias('v', 'version')
      .argv;

    // Load config.
    let configPath = process.argv.length >= 3 ? process.argv[process.argv.length - 1] : '';  // config path is always the last argument
    this.config = new Config(configPath);

    this.modules = [];
  }

  /**
   * Load all modules and trigger the initial sync.
   */
  run() {
    this.loadModule('Syncer');
    
    if (this.config.watch) {
      this.loadModule('Watcher');
    }
    
    if (this.config.growl) {
      this.loadModule('Growler');
    }

    this.trigger('sync');
  }

  /**
   * Load a module.
   *
   * @param {String} fileName
   * @param {...*} [args] arguments to pass to constructor
   */
  loadModule(fileName, args) {
    args = _.filter(arguments, (val, i) => i > 0);  // capture all provided arguments except fileName
    args.unshift(null);                             // unshift so apply is called correctly
    let module = require(`./modules/${fileName}`);  // require the module
    module = Function.bind.apply(module, args);     // create a function that applies the arguments to the constructor
    let instance = new module;                      // finally, call the constructor

    this.modules.push(instance);
  }

  /**
   * Trigger an event on all loaded modules.
   *
   * @param {String} eventName
   * @param {...*} [args]
   */
  trigger(eventName, args) {
    _.each(this.modules, (module) => {
      module.emit.apply(module, arguments)
    });
  }

  getAuthorString() {
    let pkg = require('../package.json');
    return `Cynch ${pkg.version}\nWritten by ${pkg.author.name} <${pkg.author.email}>\n${pkg.homepage}`;
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