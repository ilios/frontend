import {
  clickable,
  collection,
  create,
  fillable,
  isPresent,
  property,
  text,
} from 'ember-cli-page-object';
import userNameInfo from 'frontend/tests/pages/components/user-name-info';
import userStatus from 'frontend/tests/pages/components/user-status';
import { scrollTo, isInView } from 'frontend/tests/helpers';

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
      userStatus,
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
    add: clickable('[data-test-add-user]'),
    canBeAdded: isPresent('[data-test-add-user]'),
    scrollTo: scrollTo('td:eq(1)'),
    isInView: isInView('td:eq(1)'),
  }),
  add: clickable('button.done'),
  addButtonText: text('button.done'),
  membersCanBeAdded: isPresent('button.done'),
};

export default definition;
export const component = create(definition);
