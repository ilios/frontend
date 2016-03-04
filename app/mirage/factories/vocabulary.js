import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `Vocabulary ${i+1}`,
  terms: []
});
