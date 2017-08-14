/* eslint-env node */
'use strict';

module.exports = {
  name: 'ilios-common',

  included: function() {
    this._super.included.apply(this, arguments);
  },

  isDevelopingAddon: function() {
    return true;
  }
};
