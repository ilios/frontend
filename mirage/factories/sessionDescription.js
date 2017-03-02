import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  description: (i) => `session description ${i}`,
  session: 1
});
