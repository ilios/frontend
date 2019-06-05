import Component from '@ember/component';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  classNames: ['course-director-manager'],

  'data-test-course-director-manager': true,

  course: null,
  directors: null,

  actions: {
    addDirector(user){
      this.directors.pushObject(user);
    },

    removeDirector(user){
      this.directors.removeObject(user);
    },
  },

  saveChanges: task(function* () {
    yield timeout(10);  //small timeout so spinner has time to load
    const directors = this.directors;
    yield this.save(directors);
  }).drop()
});
