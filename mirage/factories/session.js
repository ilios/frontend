import { Factory, association } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `session ${i}`,
  sessionType: association(),
  attireRequired : false,
  equipmentRequired : false,
  supplemental : false,
});
