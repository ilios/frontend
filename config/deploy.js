/* eslint-env node */
const API_VERSION = require('./api-version.js');

module.exports = function(deployTarget) {
  var ENV = {
    build: {},
    pipeline: {
      runOrder: {
        'archive': { after: 'json-config' },
      },
    },
    's3-index': {
      region: 'us-west-2',
      filePattern(context){
        return context.archiveName;
      },
      distDir(context){
        return context.archivePath;
      },
    },
    'revision-data': {
      type: 'git-commit',
    },
    archive: {
      archiveName: 'frontend.tar.gz',
    },
  };

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
    ENV['s3-index'].bucket = 'frontend-archive-staging';
    ENV['s3-index'].prefix = API_VERSION;
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    ENV['s3-index'].bucket = 'frontend-archive-production';
    ENV['s3-index'].prefix = API_VERSION;
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
