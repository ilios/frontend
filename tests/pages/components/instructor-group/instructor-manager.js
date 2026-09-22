import { collection, clickable, create, text } from 'ember-cli-page-object';
import userNameInfo from 'frontend/tests/pages/components/user-name-info';
import userSearch from 'frontend/tests/pages/components/user-search';
import userStatus from 'frontend/tests/pages/components/user-status';

const definition = {
  scope: '[data-test-instructor-group-instructor-manager]',
  selectedInstructors: {
    scope: '[data-test-selected-instructors]',
    label: text('label'),
    users: collection('[data-test-selected-instructor]', {
      userStatus,
      userNameInfo,
      remove: clickable('[data-test-remove]'),
    }),
  },
  noSelectedInstructors: {
    scope: '[data-test-no-selected-instructors]',
  },
  availableInstructors: {
    scope: '[data-test-available-instructors]',
    label: text('label'),
    userSearch,
  },
};

export default definition;
export const component = create(definition);
