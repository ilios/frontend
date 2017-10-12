import Controller from '@ember/controller';

export default Controller.extend({
  actions: {
    loadCourse(newCourse){
      this.transitionToRoute('course', newCourse);
    }
  }
});
