import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  title: (i) => `session ${i}`,
  attireRequired : false,
  equipmentRequired : false,
  supplemental : false,
});
