import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name: (i) => `descriptor ${i}`,
  annotation: (i) => `descriptor annotation ${i}`
});
