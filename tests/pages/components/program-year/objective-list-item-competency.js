import {
  clickable,
  create,
  isHidden,
  isPresent,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-objective-list-item-competency]',
  competencyTitle: text('[data-test-competency]'),
  domainTitle: text('[data-test-domain]'),
  empty: isHidden('[data-test-competency]'),
  hasCompetency: isPresent('[data-test-competency]'),
  hasDomain: isPresent('[data-test-domain]'),
  manage: clickable('[data-test-manage]'),
  save: clickable('[data-test-save]'),
  cancel: clickable('[data-test-cancel]'),
  canSave: isPresent('[data-test-save]'),
  canCancel: isPresent('[data-test-cancel]'),
};

export default definition;
export const component = create(definition);
