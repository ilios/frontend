import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  startYear: (i) => 2012 + i,
  program: (i) => (i+1),
  published: true,
  publishedAsTbd: false,
  cohort: (i) => (i+1),
  archived: false,
});
