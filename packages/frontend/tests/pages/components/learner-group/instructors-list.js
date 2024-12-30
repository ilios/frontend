import { collection, create, text } from 'ember-cli-page-object';
import userNameInfo from 'ilios-common/page-objects/components/user-name-info';

const definition = {
  scope: '[data-test-learner-group-instructors-list]',
  title: text('[data-test-title]'),
  manage: {
    scope: '[data-test-manage]',
  },
  assignedInstructors: collection('[data-test-assigned-instructor]', {
    userNameInfo,
  }),
};

export default definition;
export const component = create(definition);
