/* eslint-env node */
'use strict';

var defaultAllowedBaseStrings = ['(', ')', ',', '.', '&', '+', '-', '=', '*', '/', '#', '%', '!', '?', ':', '[', ']', '{', '}', '<', '>', '•', '—', ' ', '|'];

module.exports = {
  extends: 'recommended',
  rules: {
    'bare-strings': ['?', '»', '&mdash;'].concat(defaultAllowedBaseStrings),
    'block-indentation': true,
    'html-comments': false,
    'nested-interactive': false,
    'self-closing-void-elements': false,
    'img-alt-attributes': false,
    'link-rel-noopener': false,
    'invalid-interactive': false,
    'inline-link-to': false,
    'style-concatenation': false,
    'triple-curlies': false,
    'deprecated-each-syntax': false,
  }
};
