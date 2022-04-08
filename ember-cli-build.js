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
      'courses',
      'course',
      'print_course',
      'course-materials',
      'instructorGroups',
      'instructorGroup',
      'programs',
      'program',
      'learnerGroups',
      'learnerGroup',
      'admin-dashboard',
      'users',
      'user',
      'schools',
      'school',
      'assign-students',
      'pending-user-updates',
      'course-rollover',
      'verificationPreview',
      'curriculumInventoryReports',
      'curriculumInventoryReport',
      'curriculumInventorySequenceBlock',
      'course-visualizations',
      'course-visualize-.*',
      'session-type-visualize-.*',
      'program-year-visualize-competencies',
    ],
    packagerOptions: {
      webpackConfig: {
        plugins: [new RetryChunkLoadPlugin()],
      },
    },
  });
};
