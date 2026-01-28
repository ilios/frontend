'use strict';

const Funnel = require('broccoli-funnel');
const MergeTrees = require('broccoli-merge-trees');
const path = require('path');

module.exports = {
  name: require('./package').name,
  _env: null,

  options: {
    babel: {
      plugins: [
        require.resolve('ember-auto-import/babel-plugin'),
        require.resolve('ember-concurrency/async-arrow-task-transform'),
      ],
    },
  },

  included: function () {
    this._super.included.apply(this, arguments);

    // _findHost is private API but it's been stable in ember-cli for two years.
    this._env = this._findHost().env;

    // Import normalize.css style
    this.import(path.join('node_modules', 'normalize.css', 'normalize.css'));

    // Import the quill editor style
    const quillPath = path.join('node_modules', 'quill');
    this.import(path.join(quillPath, 'dist', 'quill.snow.css'));

    this.import(path.join('node_modules', 'flatpickr', 'dist', 'flatpickr.css'));
  },

  treeForApp(appTree) {
    const trees = [appTree];
    if (['test', 'development'].includes(this._env)) {
      const mirageDir = path.join(__dirname, 'addon-mirage-support');
      const mirageTree = new Funnel(mirageDir, { destDir: 'tests/test-support/mirage' });
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
    const nunitoDir = path.join(path.dirname(require.resolve('@fontsource/nunito')), 'files');
    const nunitoTree = new Funnel(nunitoDir, {
      destDir: 'assets/fonts/nunito',
    });
    trees.push(nunitoTree);

    const nunitoSansDir = path.join(
      path.dirname(require.resolve('@fontsource/nunito-sans')),
      'files',
    );
    const nunitoSansTree = new Funnel(nunitoSansDir, {
      destDir: 'assets/fonts/nunito-sans',
    });
    trees.push(nunitoSansTree);

    return MergeTrees(trees);
  },

  contentFor: function (type, env) {
    if (type === 'head' && env.environment !== 'test') {
      const rootUrl = env.rootUrl ? env.rootUrl : '';
      const fonts = [
        'nunito/nunito-latin-200-normal.woff2',
        'nunito/nunito-latin-400-normal.woff2',
        'nunito/nunito-latin-400-italic.woff2',
        'nunito/nunito-latin-600-normal.woff2',
        'nunito-sans/nunito-sans-latin-400-normal.woff2',
        'nunito-sans/nunito-sans-latin-600-normal.woff2',
      ];
      const links = fonts.map((font) => {
        return `<link rel="preload" href="${rootUrl}/assets/fonts/${font}" as="font" type="font/woff2" crossorigin="anonymous">`;
      });

      return links.join('\n');
    }
  },
};
