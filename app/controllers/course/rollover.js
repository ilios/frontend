import Ember from 'ember';

const { Controller } = Ember;

export default Controller.extend({
  actions: {
    loadCourse(newCourse){
      this.transitionToRoute('course', newCourse);
    }
  }
});
