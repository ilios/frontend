'use strict';

var defaultAllowedBaseStrings = ['(', ')', ',', '.', '&', '+', '-', '=', '*', '/', '#', '%', '!', '?', ':', '[', ']', '{', '}', '<', '>', '•', '—', ' ', '|'];

module.exports = {
  extends: 'recommended',
  rules: {
    'no-bare-strings': ['?', '»', '&mdash;'].concat(defaultAllowedBaseStrings),
    'block-indentation': true,
    'no-html-comments': true,
    'no-nested-interactive': true,
    'self-closing-void-elements': true,
    'img-alt-attributes': false,
    'no-invalid-interactive': false,
    'inline-link-to': true,
    'no-triple-curlies': false,
    'deprecated-each-syntax': true,
    'deprecated-inline-view-helper': false,
    'simple-unless': false
  }
};
