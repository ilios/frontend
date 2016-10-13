/* eslint-env node */

module.exports = function(deployTarget) {
  const API_VERSION = 'v1.12';
  var ENV = {
    build: {},
    exclude: ['.DS_Store', '*-test.js'],
    'revision-data': {
      type: 'git-commit',
    }
  };

  ENV.s3 = {
    acl: 'public-read',
    region: 'us-west-2',
    bucket: 'ilios-frontend-assets'
  };

  ENV['s3-index'] = {
    region: 'us-west-2',
    filePattern: 'index.json',
    bucket: 'frontend-json-config',
  };

  ENV.gzip = {
    //dont gzip the json index file
    ignorePattern: '**/index.json'
  };

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
    ENV['s3-index'].prefix = 'stage-' + API_VERSION;
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    ENV['s3-index'].prefix = 'prod-' + API_VERSION;
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
