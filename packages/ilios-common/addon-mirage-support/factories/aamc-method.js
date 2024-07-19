import { Factory } from 'miragejs';

export default Factory.extend({
  description: (i) => `aamc method ${i}`,
  active: true,
});
