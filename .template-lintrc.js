'use strict';

module.exports = {
  plugins: ['@ilios/ember-template-lint-plugin'],
  extends: 'ilios:recommended',
  rules: {
    'no-implicit-this': false,
    'no-action': false,
    'no-curly-component-invocation': false,
    'require-button-type': false,
    'no-invalid-interactive': false,
    'no-triple-curlies': false,
    'link-href-attributes': false,
    'simple-unless': false,
    'link-rel-noopener': false,
  }
};
