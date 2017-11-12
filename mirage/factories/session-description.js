import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  description: (i) => `session description ${i}`,
});
