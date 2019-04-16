module.exports = {
  root: true,
  extends: [
    '@ilios/eslint-config-ember-addon'
  ],
  rules: {
    'ember/no-side-effects': 0,
    'ember/use-ember-get-and-set': 0,
    'ember/no-jquery': 0,
    'ember/use-brace-expansion': 0,
    'ember/no-new-mixins': 0,
    'sort-imports': 0,
  }
};
