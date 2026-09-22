import { create } from 'ember-cli-page-object';
import header from './header';
import users from './users';
import courseAssociations from './course-associations';

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
