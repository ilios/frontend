import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title:  (i) => `cohort ${i}`,
  programYear: (i) => (i+1),
});
