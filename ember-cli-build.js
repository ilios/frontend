'use strict';
/* eslint camelcase: 0 */

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');
const { Webpack } = require('@embroider/webpack');
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const fs = require('fs');
const path = require('path');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = async function (defaults) {
  const env = EmberApp.env() || 'development';
  const isTestBuild = env === 'test';

  const config = {
    fingerprint: {
      extensions: broccoliAssetRevDefaults.extensions.concat(['webmanifest', 'svg']),
    },

    hinting: isTestBuild,
    babel: {
      plugins: [
        require.resolve('ember-concurrency/async-arrow-task-transform'),
        require.resolve('ember-qunit-nice-errors'),
      ],
    },
    'ember-cli-qunit': {
      useLintTree: false,
    },
    autoImport: {
      insertScriptsAt: 'auto-import-scripts',
      watchDependencies: ['ilios-common'],
    },
    sassOptions: {
      includePaths: ['node_modules/ember-a11y-refocus/dist/styles'],
    },
  };

  const app = new EmberApp(defaults, config);

  const { setConfig } = await import('@warp-drive/build-config');
  setConfig(app, __dirname, {
    compatWith: '5.2',
    deprecations: {
      // New projects can safely leave this deprecation disabled.
      // If upgrading, to opt-into the deprecated behavior, set this to true and then follow:
      // https://deprecations.emberjs.com/id/ember-data-deprecate-store-extends-ember-object
      // before upgrading to Ember Data 6.0
      DEPRECATE_STORE_EXTENDS_EMBER_OBJECT: false,
      DEPRECATE_TRACKING_PACKAGE: false,
    },
  });

  // Import normalize.css
  app.import(path.join('node_modules', 'normalize.css', 'normalize.css'));

  // Import Quill editor styles
  app.import(path.join('node_modules', 'quill', 'dist', 'quill.snow.css'));

  // Import flatpickr styles
  app.import(path.join('node_modules', 'flatpickr', 'dist', 'flatpickr.css'));

  // Import Nunito Font Files
  const nunitoDir = path.join(
    path.dirname(require.resolve('@fontsource-variable/nunito')),
    'files',
  );
  for (const file of fs.readdirSync(nunitoDir)) {
    app.import(path.join(nunitoDir, file), {
      destDir: 'assets/fonts/nunito',
    });
  }

  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticInvokables: true,
    staticEmberSource: true,
    // splitAtRoutes: [], disabled until https://github.com/embroider-build/embroider/issues/231 once again allows our loading routes to work
    packagerOptions: {
      webpackConfig: {
        plugins: [new RetryChunkLoadPlugin() /*, new BundleAnalyzerPlugin()*/],
        devtool: env === 'production' ? 'source-map' : 'eval',
        optimization: {
          minimize: true,
          minimizer: [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  passes: 6, // slow, but worth it
                  inline: 5,
                  reduce_funcs: false,
                },
              },
            }),
          ],
        },
        module: {
          rules: [
            {
              test: /\.svg$/,
              type: 'asset/source', // This will import SVG files as text
            },
          ],
        },
      },
    },
  });
};
