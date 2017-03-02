import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  scopeNote: (i) => `scope note ${i}`
});
