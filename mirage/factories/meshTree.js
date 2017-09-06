import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  treeNumber: (i) => `tree number ${i}`
});
