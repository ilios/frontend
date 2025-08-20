import { attribute, create } from 'ember-cli-page-object';
import weekGlance from '../week-glance';

const definition = {
  scope: '[data-test-dashboard-week]',
  weeklyLink: {
    scope: '[data-test-weekly-link] a',
    url: attribute('href'),
  },
  weekGlance,
};

export default definition;
export const component = create(definition);
