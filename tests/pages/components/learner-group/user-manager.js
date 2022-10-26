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
  scope: '[data-test-learner-group-user-manager]',
  filter: fillable('[data-test-filter]'),
  groupMembers: text('[data-test-group-members]'),
  allOtherMembers: text('[data-test-all-other-members]'),
  selectAll: {
    scope: '[data-test-headers] th:eq(0) input',
    toggle: clickable(),
    isChecked: property('checked'),
    isIndeterminate: property('indeterminate'),
  },
  usersInCurrentGroup: collection('[data-test-users-in-current-group] tr', {
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
    remove: clickable('[data-test-remove-user]'),
    canBeRemoved: isPresent('[data-test-remove-user]'),
  }),
  usersNotInCurrentGroup: collection('[data-test-users-not-in-current-group] tr', {
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
  remove: clickable('button.cancel'),
  removeButtonText: text('button.cancel'),
  membersCanBeAdded: isPresent('button.done'),
  membersCanBeRemoved: isPresent('button.cancel'),
};

export default definition;
export const component = create(definition);
