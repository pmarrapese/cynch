"use strict";

const growl = require('growl');
const _ = require('lodash');

class Growl {
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

    options = _.defaults(options || {}, {
      title: title || 'Cynch',
      name: 'Cynch'
    });
    growl(message, options);
  }
}

module.exports = Growl;