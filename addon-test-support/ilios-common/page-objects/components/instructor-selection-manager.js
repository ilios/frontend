import { clickable, collection, create, text } from 'ember-cli-page-object';
import userNameInfo from './user-name-info';
import search from './user-search';

const definition = {
  scope: '[data-test-instructor-selection-manager]',
  search,
  instructors: collection('[data-test-instructors] li', {
    userNameInfo,
    remove: clickable('.remove'),
  }),
  instructorGroups: collection('[data-test-instructor-group]', {
    title: text('[data-test-instructor-group-title]'),
    members: collection('[data-test-instructor-group-members] li', {
      userNameInfo,
    }),
    remove: clickable('[data-test-instructor-group-title]'),
  }),
};

export default definition;
export const component = create(definition);
