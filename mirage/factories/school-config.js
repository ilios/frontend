import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  school: association(),
  name: (i) => `key_${i}`,
  value: (i) => `value_${i}`,
});
