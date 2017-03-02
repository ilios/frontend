import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  school: (i) => i,
  name: (i) => `key_${i}`,
  value: (i) => `value_${i}`,
});
