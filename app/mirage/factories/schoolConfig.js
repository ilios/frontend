import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  school: (i) => i,
  key: (i) => `key_${i}`,
  value: (i) => `value_${i}`,
});
