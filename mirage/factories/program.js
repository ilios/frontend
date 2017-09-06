import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `program ${i}`,
  shortTitle: (i) => `short_${i}`,
  school: (i) => (i+1),
  duration: 4,
  published: true,
  publishedAsTbd: false,
});
