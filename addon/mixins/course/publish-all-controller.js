import Mixin from '@ember/object/mixin';
import { action } from '@ember/object';

export default Mixin.create({
  @action
  returnToList(){
    this.transitionToRoute('course.index', this.model);
  }
});
