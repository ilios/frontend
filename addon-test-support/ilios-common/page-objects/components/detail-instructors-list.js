import { collection, create, text } from 'ember-cli-page-object';
import userNameInfo from './user-name-info';

const definition = {
  scope: '[data-test-instructors-list]',
  instructors: collection('[data-test-instructor-group] li', {
    userNameInfo,
  }),
  instructorGroups: collection('[data-test-instructor-group]', {
    title: text('[data-test-instructor-group-title]'),
    members: collection('[data-test-instructor-group-members] li', {
      userNameInfo,
    }),
  }),
};

export default definition;
export const component = create(definition);
