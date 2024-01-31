import {
  clickable,
  collection,
  create,
  fillable,
  isPresent,
  property,
} from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-learner-group-members]',
  filter: fillable('[data-test-filter]'),
  users: collection('table tbody tr', {
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
  }),
};

export default definition;
export const component = create(definition);
