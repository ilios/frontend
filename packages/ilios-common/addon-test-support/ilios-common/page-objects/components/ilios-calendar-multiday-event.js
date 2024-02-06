import { clickable, create, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-ilios-calendar-multiday-event]',
  name: text('[data-test-event-name]'),
  isDisabled: property('disabled', 'button'),
  click: clickable('button'),
};

export default definition;
export const component = create(definition);
