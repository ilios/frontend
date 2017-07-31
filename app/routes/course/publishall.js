import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';


export default  Route.extend({
  flashMessages: service(),
  actions: {
    returnToList(){
      this.transitionTo('course.index', this.modelFor('course'));
    }
  }
});
