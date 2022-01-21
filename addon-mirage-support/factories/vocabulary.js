import { Factory } from 'miragejs';

export default Factory.extend({
  title: (i) => `Vocabulary ${i + 1}`,
});
