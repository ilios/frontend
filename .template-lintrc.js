/* eslint-env node */
'use strict';

var defaultAllowedBaseStrings = ['(', ')', ',', '.', '&', '+', '-', '=', '*', '/', '#', '%', '!', '?', ':', '[', ']', '{', '}', '<', '>', '•', '—', ' ', '|'];

module.exports = {
  extends: 'recommended',
  rules: {
    'bare-strings': ['?', '»', '&mdash;'].concat(defaultAllowedBaseStrings),
    'block-indentation': true,
    'html-comments': true,
    'nested-interactive': true,
    'self-closing-void-elements': true,
    'img-alt-attributes': false,
    'invalid-interactive': false,
    'inline-link-to': true,
    'triple-curlies': false,
    'deprecated-each-syntax': true,
    'simple-unless': false,
    'deprecated-inline-view-helper': false,
  }
};
