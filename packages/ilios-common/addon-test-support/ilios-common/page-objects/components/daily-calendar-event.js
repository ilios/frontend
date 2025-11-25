import { attribute, create, isPresent, text } from 'ember-cli-page-object';

const definition = {
  scope: '[data-test-daily-calendar-event]',
  name: text('[data-test-name]'),
  time: text('[data-test-time]'),
  style: attribute('style'),
  isScheduled: isPresent('[data-test-scheduled-icon]'),
  isDraft: isPresent('[data-test-draft-icon]'),
  wasRecentlyUpdated: isPresent('[data-test-recently-updated-icon]'),
  preworkIndicator: {
    scope: '[data-test-has-prework-icon]',
    title: text('title'),
  },
};

export default definition;
export const component = create(definition);
