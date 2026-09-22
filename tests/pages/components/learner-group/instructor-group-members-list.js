import { create, collection } from 'ember-cli-page-object';
import userNameInfo from 'frontend/tests/pages/components/user-name-info';

const definition = {
  scope: '[data-test-learner-group-instructor-group-members-list]',
  users: collection('[data-test-instructor-group-member]', {
    userNameInfo,
  }),
};

export default definition;
export const component = create(definition);
