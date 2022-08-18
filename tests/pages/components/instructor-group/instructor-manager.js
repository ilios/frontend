import { collection, clickable, create, text } from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';
import userSearch from 'ilios-common/page-objects/components/user-search';

const definition = {
  scope: '[data-test-instructor-group-instructor-manager]',
  selectedInstructors: {
    scope: '[data-test-selected-instructors]',
    label: text('label'),
    users: collection('[data-test-selected-instructor]', {
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
