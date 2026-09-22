import { collection, clickable, create, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-school-session-types-collapsed]',
  title: text('[data-test-title]'),
  expand: clickable('[data-test-title]'),
  sessionTypeMethods: collection('[data-test-session-type-methods]', {
    title: text('td:nth-of-type(1)'),
    summary: text('td:nth-of-type(2)'),
  }),
};

export default definition;
export const component = create(definition);
