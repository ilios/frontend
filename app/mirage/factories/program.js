import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `program ${i}`,
  shortTitle: (i) => `short_${i}`,
  owningSchool: (i) => (i+1),
  duration: 4,
  deleted: false,
  publishedAsTbd: false,
});
