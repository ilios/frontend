import { clickable, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-user-profile-ics]',
  title: text('[data-test-title]'),
  refresh: clickable('[data-test-refresh-key]'),
  cancel: clickable('[data-test-cancel]'),
  manage: clickable('[data-test-manage]'),
  key: {
    scope: '[data-test-key]',
    instructions: text('[data-test-instructions]'),
    copy: {
      scope: '[data-test-copy]',
      successMessage: {
        scope: '[data-test-success-message]',
      },
      click: clickable('button'),
    },
  },
};

export default definition;
export const component = create(definition);
