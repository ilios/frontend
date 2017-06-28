/* eslint-env node */

module.exports = function(deployTarget) {
  var ENV = {
    build: {},
    pipeline: {
      // This setting runs the ember-cli-deploy activation hooks on every deploy
      // which is necessary in order to run ember-cli-deploy-cloudfront.
      // To disable CloudFront invalidation, remove this setting or change it to `false`.
      // To disable ember-cli-deploy-cloudfront for only a particular environment, add
      // `ENV.pipeline.activateOnDeploy = false` to an environment conditional below.
      activateOnDeploy: true
    },
    s3: {
      acl: 'public-read',
      filePattern: '*',
      region: 'us-west-2',
    },
    cloudfront: {
    },
  };

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
    ENV.s3.bucket = 'ilios-lti-app-staging';
    ENV.cloudfront.distribution = 'E8JZZJVG36758';
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    ENV.s3.bucket = 'ilios-lti-app-production';
    ENV.cloudfront.distribution = 'E33FMSW7332DVL';
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
