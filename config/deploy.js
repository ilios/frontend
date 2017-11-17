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
    cloudfront: {
      objectPaths(context){
        return `/${context.archiveName}`;
      },
    },
    'json-config': {
      jsonBlueprint(context, pluginHelper) {
        var jsonBlueprint = pluginHelper.readConfigDefault('jsonBlueprint');
        jsonBlueprint.meta.selector = 'meta';
        jsonBlueprint.meta.attributes.push('charset');
        jsonBlueprint.meta.attributes.push('http-equiv');
        jsonBlueprint.link.attributes.push('sizes');
        jsonBlueprint.link.attributes.push('type');
        jsonBlueprint.style = {
          selector: 'style',
          attributes: ['type'],
          includeContent: true,
        };
        jsonBlueprint.noScript = {
          selector: 'noscript',
          attributes: false,
          includeHtmlContent: true,
        };
        jsonBlueprint.div = {
          selector: '[data-deploy]',
          attributes: ['id', 'class'],
          includeHtmlContent: true,
        };

        return jsonBlueprint;
      }
    }
  };

  if (deployTarget === 'staging') {
    ENV.build.environment = 'production';
    ENV['s3-index'].bucket = 'frontend-archive-staging';
    ENV['s3-index'].prefix = API_VERSION;
    ENV['cloudfront'].distribution = 'E1W0LI6DFZEQOV';
  }

  if (deployTarget === 'production') {
    ENV.build.environment = 'production';
    ENV['s3-index'].bucket = 'frontend-archive-production';
    ENV['s3-index'].prefix = API_VERSION;
    ENV['cloudfront'].distribution = 'E1RJJYSB507IYA';
  }
  if (deployTarget === 'development') {
    ENV.pipeline = {
      disabled: {
        's3-index': true,
        'cloudfront': true,
      },
    };
  }

  // Note: if you need to build some configuration asynchronously, you can return
  // a promise that resolves with the ENV object instead of returning the
  // ENV object synchronously.
  return ENV;
};
