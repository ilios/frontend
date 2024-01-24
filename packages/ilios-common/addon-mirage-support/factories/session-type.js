import { Factory } from 'miragejs';

export default Factory.extend({
  title: (i) => `session type ${i}`,
  active: true,
});
