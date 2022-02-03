import { Factory } from 'miragejs';

export default Factory.extend({
  title: (i) => `course objective ${i}`,
  position: (i) => i,
  active: true,
});
