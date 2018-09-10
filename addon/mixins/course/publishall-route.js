import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';

export default Mixin.create({
  flashMessages: service(),
  actions: {
    returnToList(){
      this.transitionTo('course.index', this.modelFor('course'));
    }
  }
});
