import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  name:  (i) => `event ${i}`,
  location:  (i) => `room ${i}`,
  sessionDescription:  (i) => `${i} is the best ${i} yet`,
  sessionTypeTitle:  'lecture',
  isPublished: true,
  isScheduled: false,
  instructors: () => [],
  learningMaterials: () => []
});
