import Ember from 'ember';
import CurrentUser from '../mixins/current-user';

export default  Ember.Route.extend(CurrentUser, {
  model: function() {
    var currentSchool = '0';
    return this.store.find('program', {owningSchool: currentSchool});
  },
  setupController: function(controller, model){
    controller.set('currentUser', this.get('currentUser'));
    controller.set('currentSchool', 0);
    controller.set('model', model);
  }
});
