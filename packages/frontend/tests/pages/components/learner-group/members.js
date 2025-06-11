import { clickable, collection, create, fillable, isPresent } from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-learner-group-members]',
  filter: fillable('[data-test-filter]'),
  users: collection('table tbody tr', {
    name: {
      scope: 'td:eq(0)',
      isClickable: isPresent('button'),
      click: clickable('button'),
      isDisabled: isPresent('[data-test-is-disabled]'),
      userNameInfo,
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
