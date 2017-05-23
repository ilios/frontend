import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `session type ${i}`,
  active: true,
});
