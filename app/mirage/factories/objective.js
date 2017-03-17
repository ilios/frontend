import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `objective ${i}`,
  position: 0,
});
