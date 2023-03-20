import { collection, create } from 'ember-cli-page-object';
import userNameInfo from './user-name-info';
const definition = {
  scope: '[data-test-selected-instructor-group-members]',
  members: collection('[data-test-selected-instructor-group-member]', {
    userNameInfo,
  }),
};

export default definition;
export const component = create(definition);
