'use strict';

module.exports = {
  root: true,
  extends: [
    '@ilios/eslint-config-ember'
  ],
  rules: {
    'ember/use-brace-expansion': 0,
    'ember/no-capital-letters-in-routes': 0,
    'ember/no-unnecessary-route-path-option': 0,
    'ember/routes-segments-snake-case': 0,
    'sort-imports': 0
  }
};
