import { Factory } from 'miragejs';

export default Factory.extend({
  username: (i) => `username${i}`,
});
