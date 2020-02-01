import {
  create,
  clickable,
  collection,
  hasClass,
  isPresent,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-monthly-calendar]',
  days: collection('[data-test-day]', {
    number: text('[data-test-number]'),
    selectDay: clickable('button', { scope: '[data-test-number]' }),
    isTuesday: hasClass('day-2'),
    isWednesday: hasClass('day-3'),
    isFirstWeek: hasClass('week-1'),
    isSecondWeek: hasClass('week-2'),
    events: collection('[data-test-ilios-calendar-event]', {}),
    hasShowMore: isPresent('[data-test-show-more-button]'),
    showMore: clickable('[data-test-show-more-button]'),
  }),
};

export default definition;
export const component = create(definition);
