import {
  clickable,
  collection,
  create,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learnergroup-user-manager]',
  usersInCurrentGroup: collection('[data-test-users-in-current-group] tr', {
    fullName: text('td', {at: 1}),
    campusId: text('td', {at: 2}),
    email: text('td', {at: 3}),
    remove: clickable('.no.clickable'),
  }),
  usersNotInCurrentGroup: collection('[data-test-users-not-in-current-group] tr', {
    fullName: text('td', {at: 1}),
    campusId: text('td', {at: 2}),
    email: text('td', {at: 3}),
    remove: clickable('.no.clickable'),

  }),
};

export default definition;
export const component = create(definition);
