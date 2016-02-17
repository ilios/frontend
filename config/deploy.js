/* eslint-env node */

module.exports = function(deployTarget) {
  var ENV = {
    build: {},
    exclude: ['.DS_Store', '*-test.js']
    // include other plugin configuration that applies to all deploy targets here
  };

  ENV.s3 = {
    acl: 'public-read',
    region: 'us-west-2',
    // bucket: 'ilios-frontend-assets'
  };

  ENV.redis = {
    // host: '<your-redis-host>',
    // port: '<your-redis-port>',
    // password: '<your-redis-password>',
    filePattern: 'index.json'
  };

  ENV.gzip = {
    filePattern: '**/*.{js,css,ico,map,xml,txt,svg,eot,ttf,woff,woff2}'
  };

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
  }

  if (deployTarget === 'development') {
    ENV.build.environment = 'production';
    ENV.s3.region = 'us-west-1';
    ENV.s3.bucket = 'dev-ilioscdn';
    ENV.redis.host = '192.168.99.100';
    ENV.redis.allowOverwrite = true;
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
