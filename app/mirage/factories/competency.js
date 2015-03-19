import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `competency ${i}`,
  owningSchool: 1,
});
