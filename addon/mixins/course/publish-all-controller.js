import Mixin from '@ember/object/mixin';

export default Mixin.create({
  actions: {
    returnToList(){
      this.transitionToRoute('course.index', this.model);
    }
  }
});
