import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `instructor group ${i}`,
  school: (i) => (i+1),
});
