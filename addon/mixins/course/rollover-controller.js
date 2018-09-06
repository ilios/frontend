import Mixin from '@ember/object/mixin';

export default Mixin.create({
  actions: {
    loadCourse(newCourse){
      this.transitionToRoute('course', newCourse);
    }
  }
});
