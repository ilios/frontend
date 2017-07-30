import Ember from 'ember';


export default  Ember.Route.extend({
  flashMessages: Ember.inject.service(),
  actions: {
    returnToList(){
      this.transitionTo('course.index', this.modelFor('course'));
    }
  }
});
