'use strict';

const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const path = require('path');
const WriteFile = require('broccoli-file-creator');

module.exports = {
  name: require('./package').name,
  _env: null,

  options: {
    babel: {
      plugins: [
        require.resolve('ember-auto-import/babel-plugin'),
        require.resolve('@babel/plugin-proposal-nullish-coalescing-operator'),
      ]
    }
  },

  included: function() {
    this._super.included.apply(this, arguments);

    // _findHost is private API but it's been stable in ember-cli for two years.
    this._env = this._findHost().env;

    // Import normalize.css style
    this.import(path.join('node_modules', 'normalize.css', 'normalize.css'));

    // Import the froala editor styles
    const froalaPath = path.join('node_modules', 'froala-editor');
    this.import(path.join(froalaPath, 'css', 'froala_editor.css'));
    this.import(path.join(froalaPath, 'css', 'froala_style.css'));
    this.import(path.join(froalaPath, 'css', 'themes', 'gray.css'));
    this.import(path.join(froalaPath, 'css', 'plugins', 'code_view.css'));
  },

  contentFor(type, config) {
    const emberGoogleFonts = this.addons.find((a) => a.name === 'ember-cli-google-fonts');
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
      if (Object.prototype.hasOwnProperty.call(plugin, 'name') && 'v-get' === plugin.name) {
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
    if (['test', 'development'].includes(this._env)) {
      const mirageDir = path.join(__dirname, 'addon-mirage-support');
      const mirageTree = new Funnel(mirageDir, { destDir: 'mirage' });
      trees.push(mirageTree);
    } else {
      //add a noop export for production builds
      const noopTree = WriteFile('setup.js', 'export default function(){};');
      const mirageTree = new Funnel(noopTree, { destDir: 'mirage' });
      trees.push(mirageTree);
    }
    return MergeTrees(trees);
  },

  treeForAddonTestSupport(tree) {
    // intentionally not calling _super here
    // so that we can have our `import`'s be
    // import { ... } from 'ilios-common';

    return this.preprocessJs(tree, '/', this.name, {
      registry: this.registry,
    });
  },
};
