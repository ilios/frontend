import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `program ${i}`,
  shortTitle: (i) => `short_${i}`,
  school: association(),
  duration: 4,
  published: true,
  publishedAsTbd: false,
});
