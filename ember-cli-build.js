'use strict';
/* eslint camelcase: 0 */

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require( 'broccoli-asset-rev/lib/default-options' );

module.exports = function(defaults) {
  const env = EmberApp.env() || 'development';
  const isProductionLikeBuild = ['production', 'staging', 'preview'].indexOf(env) > -1;
  const isTestBuild = env === 'test';

  let app = new EmberApp(defaults, {
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
    'ember-froala-editor': {
      languages: ['fr','es'],
      plugins: ['lists', 'code_view', 'link'],
      themes: 'gray'
    },
    'ember-service-worker': {
      immediateClaim: false,
      skipWaitingOnMessage: true,
      versionStrategy: 'every-build',
    },
    'asset-cache': {
      version: '3',
      include: [
        'assets/**/*',
        'ilios-prerender/*',
      ]
    },
    'esw-cache-first': {
      version: '1',
      patterns: [
        'fonts/fontawesome(.+)',
      ]
    },
    'esw-index': {
      version: '3',
      excludeScope: [/\/tests(\?.*)?$/],
      includeScope: [
        /\/dashboard(\/.*)?$/,
        /\/courses(\/.*)?$/,
        /\/course-materials(\/.*)?$/,
        /\/instructorgroups(\/.*)?$/,
        /\/learnergroups(\/.*)?$/,
        /\/programs(\/.*)?$/,
        /\/admin(\/.*)?$/,
        /\/login(\/.*)?$/,
        /\/logout(\/.*)?$/,
        /\/schools(\/.*)?$/,
        /\/myprofile(\/.*)?$/,
        /\/mymaterials(\/.*)?$/,
        /\/course-rollover(\/.*)?$/,
        /\/curriculum-inventory-reports(\/.*)?$/,
        /\/curriculum-inventory-sequence-block(\/.*)?$/,
        /\/data(\/.*)?$/,
        /\/weeklyevents(\/.*)?$/,
      ]
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

  app.import('node_modules/normalize.css/normalize.css');

  return app.toTree();
};
