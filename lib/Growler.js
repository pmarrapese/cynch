"use strict";

const growl = require('growl');
const _ = require('lodash');
const path = require('path');

class Growler {
  static info(title, message) {
    this.growl(title, message);
  }

  static error(title, message) {
    this.growl(title, message);
  }

  static growl(title, message, options) {
    if (!message) {
      message = title;
      title = '';
    }

    let projectName = path.basename(path.dirname(App.config.source));

    options = _.defaults(options || {}, {
      title: (title || 'Cynch $PROJ_NAME').replace('$PROJ_NAME', projectName),
      name: 'Cynch'
    });
    growl(message, options);
  }
}

module.exports = Growler;