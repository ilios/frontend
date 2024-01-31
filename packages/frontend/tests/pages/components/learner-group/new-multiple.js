import { create, clickable, fillable, isVisible } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learner-group-new-multiple]',
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  isVisible: isVisible(),
  setNumberOfGroups: fillable('[data-test-number-of-groups]'),
};

export default definition;
export const component = create(definition);
