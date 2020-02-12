import {
  clickable,
  create,
  collection,
  hasClass,
  text,
} from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-weekly-calendar]',
  longWeekOfYear: text('[data-test-week-of-year] [data-test-long]'),
  shortWeekOfYear: text('[data-test-week-of-year] [data-test-short]'),
  events: collection('[data-test-weekly-calendar-event]', {
    name: text('[data-test-name]'),
    isFirstDayOfWeek: hasClass('day-1'),
    isSecondDayOfWeek: hasClass('day-2'),
    isThirdDayOfWeek: hasClass('day-3'),
    isFourthDayOfWeek: hasClass('day-4'),
    isFifthDayOfWeek: hasClass('day-5'),
    isSixthDayOfWeek: hasClass('day-6'),
    isSeventhDayOfWeek: hasClass('day-7'),
  }),
  dayHeadings: collection('[data-test-day-headings] div', {
    selectLongDay: clickable('[data-test-long]'),
    selectShortDay: clickable('[data-test-short]'),
    isFirstDayOfWeek: hasClass('day-1'),
    isSecondDayOfWeek: hasClass('day-2'),
    isThirdDayOfWeek: hasClass('day-3'),
    isFourthDayOfWeek: hasClass('day-4'),
    isFifthDayOfWeek: hasClass('day-5'),
    isSixthDayOfWeek: hasClass('day-6'),
    isSeventhDayOfWeek: hasClass('day-7'),
  }),
};

export default definition;
export const component = create(definition);
