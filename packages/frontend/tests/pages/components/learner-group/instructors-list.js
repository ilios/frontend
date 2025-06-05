import { collection, create, isPresent, text } from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-learner-group-instructors-list]',
  title: text('[data-test-title]'),
  manage: {
    scope: '[data-test-manage]',
  },
  assignedInstructors: collection('[data-test-assigned-instructor]', {
    isDisabled: isPresent('.disabled-user'),
    userNameInfo,
  }),
};

export default definition;
export const component = create(definition);
