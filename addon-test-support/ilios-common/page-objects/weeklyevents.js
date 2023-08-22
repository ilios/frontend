import { create, visitable } from 'ember-cli-page-object';
import backLink from './components/back-link';
import weeklyEvents from './components/weekly-events';

export default create({
  visit: visitable('/weeklyevents'),
  backLink,
  weeklyEvents,
});
