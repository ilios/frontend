'use strict';

module.exports = {
  root: true,
  extends: [
    '@ilios/eslint-config-ember'
  ],
  rules: {
    'ember/use-ember-get-and-set': 0,
    'ember/no-get': 0,
    'ember/use-brace-expansion': 0,
    'ember/no-new-mixins': 0,
    'ember/no-mixins': 0,
    'ember/no-capital-letters-in-routes': 0,
    'ember/no-unnecessary-route-path-option': 0,
    'ember/routes-segments-snake-case': 0,
    'ember/no-private-routing-service': 0,
    'ember/require-computed-macros': 0,
    'ember/require-computed-property-dependencies': 0,
    'sort-imports': 0,
  }
};
