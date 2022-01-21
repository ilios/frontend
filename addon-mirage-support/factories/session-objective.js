import { Factory } from 'miragejs';

export default Factory.extend({
  title: (i) => `session objective ${i}`,
  position: (i) => i,
  active: true,
});
