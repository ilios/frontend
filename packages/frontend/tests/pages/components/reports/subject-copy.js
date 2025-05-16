import { attribute, clickable, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-subject-report-copy]',
  button: {
    scope: '[data-test-button]',
    label: text(),
    click: clickable(),
    link: attribute('href'),
  },
};

export default definition;
export const component = create(definition);
