import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  startYear: (i) => 2012 + i,
  program: association(),
  published: true,
  publishedAsTbd: false,
  cohort: association(),
  archived: false,
});
