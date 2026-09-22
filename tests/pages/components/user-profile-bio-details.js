import { clickable, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-profile-bio-details]',
  manage: clickable('[data-test-manage]'),
  school: text('[data-test-school]'),
  firstName: {
    scope: '[data-test-firstname]',
    label: text('label'),
  },
  middleName: {
    scope: '[data-test-middlename]',
    label: text('label'),
  },
  lastName: {
    scope: '[data-test-lastname]',
    label: text('label'),
  },
  campusId: {
    scope: '[data-test-campus-id]',
  },
  otherId: {
    scope: '[data-test-other-id]',
    label: text('label'),
  },
  email: {
    scope: '[data-test-email]',
  },
  displayName: {
    scope: '[data-test-displayname]',
    label: text('label'),
  },
  pronouns: {
    scope: '[data-test-pronouns]',
    label: text('label'),
  },
  preferredEmail: {
    scope: '[data-test-preferred-email]',
    label: text('label'),
  },
  phone: {
    scope: '[data-test-phone]',
    label: text('label'),
  },
  username: {
    scope: '[data-test-username]',
    label: text('label'),
  },
  password: {
    scope: '[data-test-password]',
    label: text('label'),
  },
};

export default definition;
export const component = create(definition);
