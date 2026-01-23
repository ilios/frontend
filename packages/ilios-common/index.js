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

  contentFor: function (type, env) {
    if (type === 'head' && env.environment !== 'test') {
      const fonts = [
        'nunito:vf@latest/latin-wght-normal.woff2',
        'nunito-sans:vf@latest/latin-wght-normal.woff2',
      ];
      const links = fonts.map((path) => {
        return `<link
          rel="preload"
          href="https://cdn.jsdelivr.net/fontsource/fonts/${path}"
          as="font"
          type="font/woff2"
          crossorigin="anonymous">`;
      });

      return links.join('\n');
    }
  },
};
