import { collection, create, hasClass, property, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-ilios-calendar-multiday-event]',
  name: text('[data-test-event-name]'),
  isDisabled: property('disabled', 'button'),
  button: {
    scope: 'button',
  },
  sessionAttributes: collection('[data-test-session-attributes] svg', {
    attire: hasClass('fa-black-tie'),
    equipment: hasClass('fa-flask'),
    attendance: hasClass('fa-calendar-check'),
    supplemental: hasClass('fa-calendar-minus'),
  }),
};

export default definition;
export const component = create(definition);
