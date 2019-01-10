/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  classNames: ['course-director-manager'],
  course: null,
  directors: null,
  'data-test-course-director-manager': true,
  saveChanges: task(function * () {
    yield timeout(10);  //small timeout so spinner has time to load
    const directors = this.directors;
    yield this.save(directors);
  }).drop(),
  actions: {
    addDirector(user){
      this.directors.pushObject(user);
    },
    removeDirector(user){
      this.directors.removeObject(user);
    },
  }
});
