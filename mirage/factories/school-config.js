import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  name: (i) => `key_${i}`,
  value: (i) => `value_${i}`,
});
