import { Factory } from 'miragejs';

export default Factory.extend({
  name: (i) => `key_${i}`,
  value: (i) => `value_${i}`,
});
