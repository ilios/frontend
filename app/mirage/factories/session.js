import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `session ${i}`,
  deleted: false,
  sessionType: 1,
  offerings: [],
  attireRequired : false,
  equipmentRequired : false,
  supplemental : false,
});
