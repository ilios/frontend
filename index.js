'use strict';

const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const path = require('path');

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
    // ACHTUNG!
    // check if v-get helper is already registered. if it's not, then add it.
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
  },

  treeForApp(appTree) {
    const trees = [appTree];
    if (this.app.env && ['test', 'development'].includes(this.app.env)) {
      const mirageDir = path.join(__dirname, 'addon-mirage-support');
      const mirageTree = new Funnel(mirageDir, { destDir: 'mirage' });
      trees.push(mirageTree);
    }
    return MergeTrees(trees);
  },

  treeForAddonTestSupport(tree) {
    // intentionally not calling _super here
    // so that can have our `import`'s be
    // import { ... } from 'ilios-common';

    return this.preprocessJs(tree, '/', this.name, {
      registry: this.registry,
    });
  },
};
