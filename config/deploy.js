/* jshint node: true */

module.exports = function(deployTarget) {
  var ENV = {
    build: {},
    exclude: ['.DS_Store', '*-test.js']
    // include other plugin configuration that applies to all deploy targets here
  };
  
  ENV.s3 = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    acl: 'public-read',
    region: 'us-west-2',
    bucket: 'ilios-frontend-assets'
  };
  
  ENV['s3-index'] = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'us-west-2'
  };

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
    ENV['s3-index'].bucket = 'frontend-apiv1.0-index-stage';
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    ENV['s3-index'].bucket = 'frontend-apiv1.0-index-prod';
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
