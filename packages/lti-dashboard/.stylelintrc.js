'use strict';

module.exports = {
  plugins: ['stylelint-scales'],
  extends: ['stylelint-config-recommended-scss'],
  rules: {
    'property-disallowed-list': ['font-size', 'line-height'],
    'font-weight-notation': 'numeric',
    'scales/font-weights': [200, 400, 600],
  },
};
