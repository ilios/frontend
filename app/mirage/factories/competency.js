import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `competency ${i}`,
  school: 1,
});
