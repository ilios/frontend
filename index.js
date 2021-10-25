'use strict';

const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const path = require('path');
const WriteFile = require('broccoli-file-creator');
const SetTransform = require('./lib/set-transform');
const HasErrorForTransform = require('./lib/has-error-for-transform');
const GetErrorsForTransform = require('./lib/get-errors-for-transform');

module.exports = {
  name: require('./package').name,
  _env: null,

  options: {
    babel: {
      plugins: [require.resolve('ember-auto-import/babel-plugin')],
    },
  },

  included: function () {
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

    this.import(path.join('node_modules', 'flatpickr', 'dist', 'flatpickr.css'));
  },

  setupPreprocessorRegistry: function (type, registry) {
    registry.add('htmlbars-ast-plugin', SetTransform.instantiate());
    registry.add('htmlbars-ast-plugin', HasErrorForTransform.instantiate());
    registry.add('htmlbars-ast-plugin', GetErrorsForTransform.instantiate());
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

  treeForPublic(publicTree) {
    const trees = [];
    if (publicTree) {
      trees.push(publicTree);
    }
    const nunitoDir = path.join(path.dirname(require.resolve('typeface-nunito')), 'files');
    const nunitoTree = new Funnel(nunitoDir, {
      destDir: 'assets/fonts/nunito',
    });
    trees.push(nunitoTree);

    const nunitoSansDir = path.join(path.dirname(require.resolve('typeface-nunito-sans')), 'files');
    const nunitoSansTree = new Funnel(nunitoSansDir, {
      destDir: 'assets/fonts/nunito-sans',
    });
    trees.push(nunitoSansTree);

    return MergeTrees(trees);
  },

  contentFor: function (type, env) {
    if (type === 'head') {
      const rootUrl = env.rootUrl ? env.rootUrl : '';
      const fonts = [
        'nunito/nunito-latin-400.woff2',
        'nunito/nunito-latin-700.woff2',
        'nunito-sans/nunito-sans-latin-400.woff2',
        'nunito-sans/nunito-sans-latin-600.woff2',
        'nunito-sans/nunito-sans-latin-700.woff2',
      ];
      const links = fonts.map((font) => {
        return `<link rel="preload" href="${rootUrl}/assets/fonts/${font}" as="font" type="font/woff2" crossorigin="anonymous">`;
      });
      const linkText = links.join('\n');

      return `
        <title>Ilios</title>
        ${linkText}
      `;
    }
  },
};
