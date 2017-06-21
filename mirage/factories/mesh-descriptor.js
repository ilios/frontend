import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  name: (i) => `descriptor ${i}`,
  annotation: (i) => `descriptor annotation ${i}`
});
