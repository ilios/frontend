import {
  clickable,
  collection,
  create,
  hasClass,
  isPresent,
  property,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-program-year-competencies]',
  title: text('[data-test-header] [data-test-title]'),
  clickTitle: clickable('[data-test-header] [data-test-title]'),
  manage: clickable('[data-test-actions] [data-test-manage]'),
  canManage: isPresent('[data-test-actions] [data-test-manage]'),
  save: clickable('[data-test-actions] [data-test-save]'),
  cancel: clickable('[data-test-actions] [data-test-cancel]'),
  list: {
    scope: '[data-test-list]',
    domains: collection('[data-test-domain]', {
      title: text('[data-test-title]'),
      isActive: hasClass('active', '[data-test-domain-title]'),
      competencies: collection('[data-test-competency]'),
    }),
  },
  manager: {
    scope: '[data-test-managed-list]',
    domains: collection('[data-test-domain]', {
      isChecked: property('checked', '[data-test-domain-label] input'),
      isIndeterminate: property('indeterminate', '[data-test-domain-label] input'),
      title: text('[data-test-domain-label]'),
      click: clickable('[data-test-domain-label]'),
      competencies: collection('[data-test-competency]', {
        isChecked: property('checked', 'input'),
      }),
    }),
  },
};

export default definition;
export const component = create(definition);
