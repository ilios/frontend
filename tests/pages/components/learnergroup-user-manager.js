import {
  clickable,
  collection,
  create,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-learnergroup-user-manager]',
  usersInCurrentGroup: collection('[data-test-users-in-current-group] tr', {
    firstName: text('td', {at: 1}),
    lastName: text('td', {at: 2}),
    campusId: text('td', {at: 3}),
    email: text('td', {at: 4}),
    remove: clickable('.no.clickable'),
  }),
  usersNotInCurrentGroup: collection('[data-test-users-not-in-current-group] tr', {
    firstName: text('td', {at: 1}),
    lastName: text('td', {at: 2}),
    campusId: text('td', {at: 3}),
    email: text('td', {at: 4}),
    remove: clickable('.no.clickable'),

  }),
};

export default definition;
export const component = create(definition);
