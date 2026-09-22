import { create, visitable } from 'ember-cli-page-object';
import backLink from './components/back-link';
import singleEvent from './components/single-event';

export default create({
  visit: visitable('/events/:slug'),
  backLink,
  singleEvent,
});
