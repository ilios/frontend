import { attribute, create, hasClass, isPresent, text, triggerable } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-weekly-calendar-event]',
  title: text('[data-test-title]'),
  name: text('[data-test-name]'),
  time: text('[data-test-time]'),
  style: attribute('style'),
  isFirstDayOfWeek: hasClass('day-1'),
  isSecondDayOfWeek: hasClass('day-2'),
  isThirdDayOfWeek: hasClass('day-3'),
  isFourthDayOfWeek: hasClass('day-4'),
  isFifthDayOfWeek: hasClass('day-5'),
  isSixthDayOfWeek: hasClass('day-6'),
  isSeventhDayOfWeek: hasClass('day-7'),
  isScheduled: isPresent('[data-test-scheduled-icon]'),
  isDraft: isPresent('[data-test-draft-icon]'),
  wasRecentlyUpdated: isPresent('[data-test-recently-updated-icon]'),
  mouseOver: triggerable('mouseover'),
  tooltip: {
    scope: '[data-test-ilios-calendar-event-tooltip]',
    resetScope: true,
  },
  preworkIndicator: {
    scope: '[data-test-has-prework-icon]',
    title: text('title'),
  },
};

export default definition;
export const component = create(definition);
