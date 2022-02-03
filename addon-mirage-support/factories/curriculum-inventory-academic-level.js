import { Factory } from 'miragejs';

export default Factory.extend({
  name: (i) => `Year ${i}`,
  level: (i) => i,
});
