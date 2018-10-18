import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  name: (i) => `Year ${i}`,
  level: (i) => i,
});
