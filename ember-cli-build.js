'use strict';
/* eslint camelcase: 0 */

const EmberApp = require('ember-cli/lib/broccoli/ember-app');
const broccoliAssetRevDefaults = require('broccoli-asset-rev/lib/default-options');
const { Webpack } = require('@embroider/webpack');
const { RetryChunkLoadPlugin } = require('webpack-retry-chunk-load-plugin');

module.exports = function (defaults) {
  const env = EmberApp.env() || 'development';
  const isTestBuild = env === 'test';

  const app = new EmberApp(defaults, {
    fingerprint: {
      extensions: broccoliAssetRevDefaults.extensions.concat(['webmanifest', 'svg']),
    },
    sourcemaps: {
      enabled: true,
    },

    hinting: isTestBuild,
    babel: {
      plugins: [require.resolve('ember-auto-import/babel-plugin')],
    },
    'ember-cli-image-transformer': {
      images: [
        {
          inputFilename: 'lib/images/sunburst.svg',
          outputFileName: 'sunburst-white-background',
          background: { r: 255, g: 255, b: 255, alpha: 1 },
          convertTo: 'png',
          sizes: [48, 96, 180, 192],
        },
        {
          inputFilename: 'lib/images/sunburst.svg',
          outputFileName: 'sunburst-transparent',
          convertTo: 'png',
          sizes: [16, 32, 48, 96, 150, 512],
        },
      ],
    },
    'ember-cli-qunit': {
      useLintTree: false,
    },
    autoImport: {
      insertScriptsAt: 'auto-import-scripts',
    },
    'ember-fetch': {
      preferNative: true,
    },
    'ember-simple-auth': {
      useSessionSetupMethod: true, //can be removed in ESA v5.x
    },
  });

  return require('@embroider/compat').compatBuild(app, Webpack, {
    staticAddonTestSupportTrees: true,
    staticAddonTrees: true,
    staticHelpers: true,
    staticComponents: true,
    splitAtRoutes: [
      'admin-dashboard',
      'assign-students',
      'course-materials',
      'course-rollover',
      'course-visualizations',
      'course-visualize-.*',
      'course',
      'courses',
      'curriculumInventoryReport',
      'curriculumInventoryReports',
      'curriculumInventorySequenceBlock',
      'instructorGroup',
      'instructorGroups',
      'learnerGroup',
      'learnerGroups',
      'pending-user-updates',
      'print_course',
      'program-year-visualize-competencies',
      'program',
      'programs',
      'school',
      'schools',
      'session-type-visualize-.*',
      'user',
      'users',
      'verificationPreview',
    ],
    packagerOptions: {
      webpackConfig: {
        plugins: [new RetryChunkLoadPlugin()],
      },
    },
  });
};
