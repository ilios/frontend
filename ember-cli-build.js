/* eslint-env node */
const EmberApp = require('ember-cli/lib/broccoli/ember-app');

module.exports = function(defaults) {
  let app = new EmberApp(defaults, {
    fingerprint: {
      exclude: ['ilios-icon.png']
    },
    'ember-cli-babel': {
      includePolyfill: true
    },
  });
  return app.toTree();
};
