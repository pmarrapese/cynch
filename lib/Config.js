"use strict";

const Q = require('q');
const fs = require('fs');
const _ = require('lodash');
const Path = require('path');

const DEFAULT_CONFIG_FILE = 'cynch.json';
const DEFAULT_CONFIG = {
  source: undefined,
  debug: false,
  targets: [],
  exclusions: [],
  inclusions: [],
  rsyncOptions: []
};

class Config {
  constructor(path) {
    path = path || '.' + Path.sep;

    if (path.substr(-1) == Path.sep) {
      // No filename provided, use default.
      path = Path.join(path, DEFAULT_CONFIG_FILE);
    }

    this.path = Path.resolve(path);
  }

  *load() {
    try {
      var buffer = yield Q.nfcall(fs.readFile, this.path);
    } catch (e) {
      throw new Error(`Failed to read config file ${this.path} from disk.`, e.stack || e.message || e);
    }

    let config = JSON.parse(buffer);

    config = _.defaults(config, DEFAULT_CONFIG);

    // Ensure these properties are always arrays.
    ['targets', 'exclusions', 'inclusions', 'rsyncOptions'].forEach((property) => {
      if (!_.isArray(config[property])) {
        config[property] = [config[property]];
      }
    });

    _.extend(this, config);

    this.parseSourcePath();
    this.parseRsyncOptions();
    this.validate();

    return this;
  }

  /**
   * If the source path is relative, make it relative to the config file.
   */
  parseSourcePath() {
    if (!this.source) {
      throw new Error('No source path specified in config file.');
    }

    if (Path.isAbsolute(this.source)) {
      // Nothing to do.
      return;
    }

    let base = Path.dirname(this.path);
    this.source = Path.resolve(Path.join(base, this.source));
  }

  /**
   * Convert any arguments into arrays if necessary.  (e.g. "chmod=777" to ["chmod", "777"])
   */
  parseRsyncOptions() {
    this.rsyncOptions = _.map(this.rsyncOptions, (option) => {
      let matches = /(.+?)=(.+)/.exec(option);

      return matches ? [matches[1], matches[2]] : option;
    });
  }

  validate() {
    if (!this.targets.length) {
      throw new Error('No targets specified in config file.');
    }

    _.each(this.targets, (target) => {
      if (!target.host || !target.path) {
        throw new Error('Target is not configured correctly: ' + JSON.stringify(target));
      }
    });
  }
}

module.exports = Config;