import { create, clickable, collection, text, isPresent } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-pending-single-user-update]',
  updates: collection('[data-test-update]', {
    explanation: text('[data-test-explanation]'),
    updateEmail: clickable('[data-test-update-email]'),
    hasUpdateEmailButton: isPresent('[data-test-update-email]'),
    excludeFromSync: clickable('[data-test-exclude-from-sync]'),
    disable: clickable('[data-test-disable]'),
  }),
};

export default definition;
export const component = create(definition);
