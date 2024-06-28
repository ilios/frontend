import { clickable, create, hasClass, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-dashboard-user-context-filter]',
  instructing: {
    isChecked: property('checked', '[data-test-instructing-input]'),
    label: text('[data-test-instructing-label]'),
    toggle: clickable('[data-test-instructing-label]'),
    isActive: hasClass('active', '[data-test-instructing-label]'),
  },
  learning: {
    isChecked: property('checked', '[data-test-learning-input]'),
    label: text('[data-test-learning-label]'),
    toggle: clickable('[data-test-learning-label]'),
    isActive: hasClass('active', '[data-test-learning-label]'),
  },
  admin: {
    isChecked: property('checked', '[data-test-admin-input]'),
    label: text('[data-test-admin-label]'),
    toggle: clickable('[data-test-admin-label]'),
    isActive: hasClass('active', '[data-test-admin-label]'),
  },
};

export default definition;
export const component = create(definition);
