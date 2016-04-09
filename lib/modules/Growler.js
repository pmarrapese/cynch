"use strict";

const CynchModule = require('../CynchModule');
const growl = require('growl');
const _ = require('lodash');
const path = require('path');

class Growler extends CynchModule {
  constructor() {
    super();
    this.registerEvents();
  }

  /**
   * Listen for growl events.
   */
  registerEvents() {
    this.on('growl', this.onGrowl);
  }

  /**
   * Handle growl events.
   *
   * @param {String} title
   * @param {String} message
   */
  onGrowl(title, message) {
    this.growl.apply(this, arguments);
  }

  growl(title, message, options) {
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