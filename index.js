'use strict';

module.exports = {
  name: require('./package').name,

  included: function() {
    this._super.included.apply(this, arguments);
  },

  contentFor(type, config) {
    let emberGoogleFonts = this.addons.find((a) => a.name === 'ember-cli-google-fonts');
    return emberGoogleFonts.contentFor(type, config);
  },

  setupPreprocessorRegistry: function(type, registry) {
    // KLUDGE!
    // check if v-get helper is already registered.
    // if not, add it.
    // this is necessary in order to make this helper available to
    // applications that include ilios-common and that use its components that make use of cp-validations.
    // @link https://github.com/offirgolan/ember-cp-validations/issues/334
    // [ST 2018/09/26]
    const registered = registry.load('htmlbars-ast-plugins');
    let isRegistered = false;
    for(let i = 0; i < registered.length; i++) {
      const plugin = registered[i];
      if (plugin.hasOwnProperty('name') && 'v-get' === plugin.name) {
        isRegistered = true;
        break;
      }
    }
    if (!isRegistered) {
      const vget = require('ember-cp-validations/htmlbars-plugins/v-get');
      registry.add('htmlbars-ast-plugin', {
        name: 'v-get',
        plugin: vget,
        baseDir: function() {
          return __dirname;
        }
      });
    }
  }
};
