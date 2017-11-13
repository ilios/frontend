import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  room:  (i) => `room ${i}`,
  site: (i) => `site ${i}`,
});
