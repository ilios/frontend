'use strict';
/* eslint camelcase: 0 */

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
    },
    sourcemaps: {
      enabled: true,
    },
    minifyCSS: { enabled: isProductionLikeBuild },
    minifyJS: { enabled: isProductionLikeBuild },

    tests: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    hinting: isTestBuild,
    babel: {
      plugins: [ require('ember-auto-import/babel-plugin') ]
    },
    'ember-cli-image-transformer': {
      images: [
        {
          inputFilename: 'lib/images/sunburst.svg',
          outputFileName: 'sunburst-white-background',
          background: {r: 255, g: 255, b: 255, alpha: 1},
          convertTo: 'png',
          sizes: [48, 96, 180, 192],
        },
        {
          inputFilename: 'lib/images/sunburst.svg',
          outputFileName: 'sunburst-transparent',
          convertTo: 'png',
          sizes: [16, 32, 48, 96, 150, 512],
        },
      ]
    },
    'ember-cli-qunit': {
      useLintTree: false
    },
    'ember-service-worker': {
      immediateClaim: true,
      versionStrategy: 'every-build',
    },
    'esw-cache-first': {
      version: '4',
      patterns: [
        'https://fonts.gstatic.com/(.+)',
      ],
    },
    newVersion: {
      enabled: true,
      useAppVersion: true
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
    autoImport: {
      publicAssetURL: '/assets'
    },
    'ember-fetch': {
      preferNative: true
    },
  });

  return app.toTree();
};
