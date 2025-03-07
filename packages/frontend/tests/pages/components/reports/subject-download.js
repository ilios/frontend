import { clickable, create, isPresent, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-subject-report-download]',
  message: {
    scope: '[data-test-message]',
    displays: isPresent(),
    text: text(),
  },
  button: {
    scope: '[data-test-button]',
    label: text(),
    click: clickable(),
    isDisabled: property('disabled'),
  },
};

export default definition;
export const component = create(definition);
