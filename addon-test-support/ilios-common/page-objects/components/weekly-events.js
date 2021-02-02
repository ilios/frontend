import { clickable, collection, create, text } from 'ember-cli-page-object';
import weekGlance from './week-glance';

const definition = {
  scope: '[data-test-weekly-events]',
  topNavigation: {
    scope: '[data-test-top-nav]',
    title: text('[data-test-year]'),
    nextYear: {
      scope: '[data-test-next]',
      title: text(),
      visit: clickable(),
    },
    previousYear: {
      scope: '[data-test-previous]',
      title: text(),
      visit: clickable(),
    },
  },
  weeks: collection('[data-test-week-glance]', weekGlance),
  bottomNavigation: {
    scope: '[data-test-bottom-nav]',
    title: text('[data-test-year]'),
    nextYear: {
      scope: '[data-test-next]',
      title: text(),
      visit: clickable(),
    },
    previousYear: {
      scope: '[data-test-previous]',
      title: text(),
      visit: clickable(),
    },
  },
};

export default definition;
export const component = create(definition);
