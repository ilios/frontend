import {
  create,
  text
} from 'ember-cli-page-object';
import weekGlance from './week-glance';

const definition = {
  scope: '[data-test-dashboard-week]',
  weeklyLink: text('[data-test-weekly-link] a'),
  weekGlance,
};

export default definition;
export const component = create(definition);
