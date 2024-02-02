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
  scope: '[data-test-learner-group-cohort-user-manager]',
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
      isClickable: isPresent('button'),
      click: clickable('button'),
      userNameInfo,
    },
    campusId: {
      scope: 'td:eq(2)',
      isClickable: isPresent('button'),
      click: clickable('button'),
    },
    email: {
      scope: 'td:eq(3)',
      isClickable: isPresent('button'),
      click: clickable('button'),
    },
    isDisabled: isPresent('td:nth-of-type(1) [data-test-is-disabled]'),
    add: clickable('[data-test-add-user]'),
    canBeAdded: isPresent('[data-test-add-user]'),
  }),
  add: clickable('button.done'),
  addButtonText: text('button.done'),
  membersCanBeAdded: isPresent('button.done'),
};

export default definition;
export const component = create(definition);
