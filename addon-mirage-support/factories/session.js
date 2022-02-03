import { Factory } from 'miragejs';

export default Factory.extend({
  title: (i) => `session ${i}`,
  description: (i) => `session description ${i}`,
  attireRequired: false,
  equipmentRequired: false,
  supplemental: false,
});
