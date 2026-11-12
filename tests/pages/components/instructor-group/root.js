import { create } from 'ember-cli-page-object';

import courseAssociations from './course-associations';
import header from './header';
import users from './users';

const definition = {
  scope: '[data-test-instructor-group-root]',
  header,
  users,
  courseAssociations,
  // overview: {
  //   scope: '[data-test-overview]',
  //   title: text('[data-test-title]'),
  //   search,
  //   users: collection('[data-test-user]', {
  //     userNameInfo,
  //     remove: clickable('[data-test-remove]'),
  //   }),
  //   courses: collection('[data-test-course]', {
  //     visit: clickable('a'),
  //   }),
  // },
};

export default definition;
export const component = create(definition);
