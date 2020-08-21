import { clickable, collection, create, fillable, hasClass, text } from 'ember-cli-page-object';
import userNameInfo from './user-name-info';

const definition = {
  scope: '[data-test-instructor-selection-manager]',
  search: fillable('.search-box input'),
  searchResults: collection('.results [data-test-result]', {
    add: clickable(),
    active: hasClass('active'),
    inactive: hasClass('inactive'),
  }),
  instructors: collection('[data-test-instructors] li', {
    userNameInfo,
    remove: clickable('.remove')
  }),
  instructorGroups: collection('[data-test-instructor-group]', {
    title: text('[data-test-instructor-group-title]'),
    members: collection('[data-test-instructor-group-members] li', {
      userNameInfo
    }),
    remove: clickable('[data-test-instructor-group-title]')
  }),
};

export default definition;
export const component = create(definition);
