import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  name:  (i) => `event ${i}`,
  isPublished: false,
  isScheduled: false
});
