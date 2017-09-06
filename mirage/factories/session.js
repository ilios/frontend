import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  title: (i) => `session ${i}`,
  sessionType: 1,
  offerings: [],
  objectives: [],
  meshDescriptors: [],
  learningMaterials: [],
  administrators: [],
  attireRequired : false,
  equipmentRequired : false,
  supplemental : false,
});
