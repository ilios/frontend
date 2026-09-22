import { attribute, create, hasClass } from 'ember-cli-page-object';
import icsFeed from './../ics-feed';

const definition = {
  scope: '[data-test-dashboard-navigation]',
  calendar: {
    scope: '[data-test-link-calendar]',
    linkTarget: attribute('href'),
    isActive: hasClass('active'),
  },
  materials: {
    scope: '[data-test-link-materials]',
    linkTarget: attribute('href'),
    isActive: hasClass('active'),
  },
  week: {
    scope: '[data-test-link-week]',
    linkTarget: attribute('href'),
    isActive: hasClass('active'),
  },
  icsFeed,
};

export default definition;
export const component = create(definition);
