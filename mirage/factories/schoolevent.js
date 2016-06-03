import Mirage from 'ember-cli-mirage';

export default Mirage.Factory.extend({
  name:  (i) => `event ${i}`,
  isPublished: false,
  isScheduled: false,
  instructors: []
});
