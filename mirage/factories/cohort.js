import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  title:  (i) => `cohort ${i}`,
  programYear: association(),
});
