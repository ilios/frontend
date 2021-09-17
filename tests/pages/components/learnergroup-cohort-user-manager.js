import {
  clickable,
  collection,
  create,
  fillable,
  isPresent,
  property,
  text,
} from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-learnergroup-cohort-user-manager]',
  filter: fillable('[data-test-filter]'),
  title: text('[data-test-title]'),
  selectAll: {
    scope: '[data-test-headers] th:eq(0) input',
    toggle: clickable(),
    isChecked: property('checked'),
    isIndeterminate: property('indeterminate'),
  },
  users: collection('[data-test-users] tr', {
    isSelected: property('checked', 'td:eq(0) input'),
    canBeSelected: isPresent('td:eq(0) input'),
    select: clickable('td:eq(0) input'),
    name: {
      scope: 'td:eq(1)',
      userNameInfo,
    },
    campusId: text('td', { at: 2 }),
    isDisabled: isPresent('td:nth-of-type(1) [data-test-is-disabled]'),
    email: text('td', { at: 3 }),
    add: clickable('[data-test-add-user]'),
    canBeAdded: isPresent('[data-test-add-user]'),
  }),
  add: clickable('button.done'),
  addButtonText: text('button.done'),
  membersCanBeAdded: isPresent('button.done'),
};

export default definition;
export const component = create(definition);
