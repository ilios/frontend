import { clickable, create, collection, text, isVisible } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-vocabularies-list]',
  vocabularies: collection('[data-test-vocabulary]', {
    title: {
      scope: '[data-test-title]',
    },
    termsCount: text('[data-test-terms-count]'),
    manage: clickable('[data-test-manage]'),
    delete: clickable('[data-test-delete]'),
    hasDeleteButton: isVisible('[data-test-delete]'),
  }),
  deletionConfirmation: {
    scope: '[data-test-confirm-removal]',
    submit: clickable('[data-test-submit-removal]'),
    cancel: clickable('[data-test-cancel-removal]'),
  },
};

export default definition;
export const component = create(definition);
