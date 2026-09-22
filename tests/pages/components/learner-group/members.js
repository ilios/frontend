import { clickable, collection, create, fillable, isPresent } from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';
import userStatus from 'ilios-common/page-objects/components/user-status';

const definition = {
  scope: '[data-test-learner-group-members]',
  filter: fillable('[data-test-filter]'),
  users: collection('table tbody tr', {
    name: {
      scope: 'td:eq(0)',
      isClickable: isPresent('button'),
      click: clickable('button'),
      userNameInfo,
      userStatus,
    },
    campusId: {
      scope: 'td:eq(1)',
      isClickable: isPresent('button'),
      click: clickable('button'),
    },
    email: {
      scope: 'td:eq(2)',
      isClickable: isPresent('button'),
      click: clickable('button'),
    },
  }),
};

export default definition;
export const component = create(definition);
