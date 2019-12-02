'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require( 'broccoli-asset-rev/lib/default-options' );

module.exports = function(defaults) {
  const env = EmberApp.env() || 'development';
  const isProductionLikeBuild = ['production', 'staging', 'preview'].indexOf(env) > -1;
  const isTestBuild = env === 'test';

  const app = new EmberApp(defaults, {
    fingerprint: {
      extensions: broccoliAssetRevDefaults.extensions.concat(['webmanifest', 'svg']),
      enabled: isProductionLikeBuild,
      exclude: ['ilios-icon.png']
    },
    sourcemaps: {
      enabled: true,
    },
    minifyCSS: { enabled: isProductionLikeBuild },
    minifyJS: { enabled: isProductionLikeBuild },

    tests: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    hinting: isTestBuild,
    babel: {
      plugins: [ require('ember-auto-import/babel-plugin') ],
    },
    'ember-cli-uglify': {
      uglify: {
        compress: {
          collapse_vars: false
        }
      }
    },
    postcssOptions: {
      compile: {
        extension: 'scss',
        enabled: true,
        parser: require('postcss-scss'),
        plugins: [
          {
            module: require('@csstools/postcss-sass'),
          },
        ]
      },
      filter: {
        enabled: true,
        plugins: [
          {
            module: require('autoprefixer'),
          }
        ]
      }
    },
    'ember-fetch': {
      preferNative: true
    },
  });

  app.import('node_modules/normalize.css/normalize.css');

  return app.toTree();
};
