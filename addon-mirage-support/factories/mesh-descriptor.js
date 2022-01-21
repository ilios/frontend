import { Factory } from 'miragejs';

export default Factory.extend({
  name: (i) => `descriptor ${i}`,
  annotation: (i) => `descriptor annotation ${i}`,
});
