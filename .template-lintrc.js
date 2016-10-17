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
    'self-closing-void-elements': false,
    'img-alt-attributes': false,
    'link-rel-noopener': true,
    'invalid-interactive': false,
    'inline-link-to': true,
    'style-concatenation': true,
    'triple-curlies': false,
    'deprecated-each-syntax': true,
  }
};
