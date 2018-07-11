'use strict';

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require( 'broccoli-asset-rev/lib/default-options' );

module.exports = function(defaults) {
  let env = EmberApp.env() || 'development';
  let isProductionLikeBuild = ['production', 'staging', 'preview'].indexOf(env) > -1;

  let app = new EmberApp(defaults, {
    fingerprint: {
      extensions: broccoliAssetRevDefaults.extensions.concat(['webmanifest', 'svg']),
      enabled: isProductionLikeBuild,
    },
    sourcemaps: {
      enabled: !isProductionLikeBuild,
    },
    minifyCSS: { enabled: isProductionLikeBuild },
    minifyJS: { enabled: isProductionLikeBuild },

    tests: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    hinting: env.EMBER_CLI_TEST_COMMAND || !isProductionLikeBuild,
    'ember-cli-babel': {
      sourceMaps: isProductionLikeBuild?false:'inline'
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
    'ember-cli-password-strength': {
      bundleZxcvbn: false
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
  });

  app.import('node_modules/normalize.css/normalize.css');

  return app.toTree();
};
