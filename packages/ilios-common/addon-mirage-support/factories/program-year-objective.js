import { Factory } from 'miragejs';

export default Factory.extend({
  title: (i) => `program-year objective ${i}`,
  position: (i) => i,
  active: true,
});
