import { collection, clickable, create, property, text } from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-assign-students]',
  title: text('[data-test-title]'),
  unassignedStudentsConfirmation: text('[data-test-unassigned-students-confirmation]'),
  toggleAll: clickable('[data-test-toggle-all]'),
  isToggleAllChecked: property('checked', '[data-test-toggle-all]'),
  isToggleAllIndeterminate: property('indeterminate', '[data-test-toggle-all]'),
  save: clickable('[data-test-submit]'),
  cohorts: {
    scope: '[data-test-cohort-selector]',
    options: collection('option'),
  },
  students: collection('[data-test-student]', {
    isToggleChecked: property('checked', '[data-test-toggle]'),
    toggle: clickable('[data-test-toggle]'),
    name: {
      scope: '[data-test-name]',
      userNameInfo,
    },
    email: text('[data-test-email]'),
    campusId: text('[data-test-campus-id]'),
  }),
  noResult: {
    scope: '[data-test-no-result]',
  },
};

export default definition;
export const component = create(definition);
