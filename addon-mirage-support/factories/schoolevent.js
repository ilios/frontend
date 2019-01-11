/* eslint ember/avoid-leaking-state-in-ember-objects: 0 */
import { Factory } from 'ember-cli-mirage';

export default Factory.extend({
  name:  (i) => `event ${i}`,
  isPublished: false,
  isScheduled: false,
  sessionObjectives: [],
  courseObjectives: [],
  prerequisites: [],
  postrequisites: [],
});
