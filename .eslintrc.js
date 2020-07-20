'use strict';

module.exports = {
  root: true,
  extends: [
    '@ilios/eslint-config-ember-addon'
  ],
  rules: {
    'ember/no-side-effects': 0,
    'ember/no-get': 0,
    'ember/use-ember-get-and-set': 0,
    'ember/use-brace-expansion': 0,
    'ember/no-new-mixins': 0,
    'ember/no-mixins': 0,
    'sort-imports': 0,
    'ember/require-computed-property-dependencies': 0,
    'ember/require-computed-macros': 0,
  }
};
