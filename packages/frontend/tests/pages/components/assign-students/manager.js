import {
  collection,
  clickable,
  create,
  fillable,
  property,
  text,
  value,
} from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-assign-students-manager]',
  title: text('[data-test-title]'),
  unassignedStudentsConfirmation: text('[data-test-unassigned-students-confirmation]'),
  toggleAll: clickable('[data-test-toggle-all]'),
  isToggleAllChecked: property('checked', '[data-test-toggle-all]'),
  isToggleAllIndeterminate: property('indeterminate', '[data-test-toggle-all]'),
  isToggleAllDisabled: property('disabled', '[data-test-toggle-all]'),
  isSaveDisabled: property('disabled', '[data-test-submit]'),
  save: clickable('[data-test-submit]'),
  cohorts: {
    scope: '[data-test-cohorts]',
    label: text('label'),
    select: fillable('select'),
    value: value('select'),
    isDisabled: property('disabled', 'select'),
    options: collection('option', {
      isSelected: property('selected'),
    }),
    noCohorts: {
      scope: '[data-test-no-cohorts]',
    },
  },
  students: collection('[data-test-student]', {
    isToggleChecked: property('checked', '[data-test-toggle]'),
    isToggleDisabled: property('disabled', '[data-test-toggle]'),
    toggle: clickable('[data-test-toggle]'),
    userNameInfo,
    email: text('[data-test-email]'),
    campusId: text('[data-test-campus-id]'),
  }),
  noResult: {
    scope: '[data-test-no-result]',
  },
};

export default definition;
export const component = create(definition);
