import { create, clickable, collection, hasClass, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-monthly-calendar]',
  monthYear: text('[data-test-month-year]'),
  days: collection('[data-test-day]', {
    number: text('[data-test-number]'),
    selectDay: clickable('button', { scope: '[data-test-number]' }),
    isFirstDayOfWeek: hasClass('day-1'),
    isSecondDayOfWeek: hasClass('day-2'),
    isThirdDayOfWeek: hasClass('day-3'),
    isFourthDayOfWeek: hasClass('day-4'),
    isFifthDayOfWeek: hasClass('day-5'),
    isSixthDayOfWeek: hasClass('day-6'),
    isSeventhDayOfWeek: hasClass('day-7'),
    isFirstWeek: hasClass('week-1'),
    isSecondWeek: hasClass('week-2'),
    isThirdWeek: hasClass('week-3'),
    events: collection('[data-test-ilios-calendar-event]'),
    hasShowMore: isPresent('[data-test-show-more-button]'),
    showMore: clickable('[data-test-show-more-button]'),
  }),
  events: collection('[data-test-ilios-calendar-event-month]'),
};

export default definition;
export const component = create(definition);
