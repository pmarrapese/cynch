"use strict";

const Boilerplate = require('@pmarrapese/node-boilerplate');
const _ = require('lodash');
const process = require('process');
const Config = require('./Config');

class App extends Boilerplate.App {
  before() {
    global.App = this;

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
}

new App();