import Ember from 'ember';

const { inject } = Ember;
const { service } = inject;

export default  Ember.Route.extend({
  flashMessages: service(),
  actions: {
    returnToList(){
      this.transitionTo('course.index', this.modelFor('course'));
    }
  }
});
