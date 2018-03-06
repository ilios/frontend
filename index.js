'use strict';

module.exports = {
  name: 'ilios-common',

  included: function() {
    this._super.included.apply(this, arguments);
  },

  contentFor(type, config) {
    let emberGoogleFonts = this.addons.find((a) => a.name === 'ember-cli-google-fonts');
    return emberGoogleFonts.contentFor(type, config);
  }
};
