import Ember from 'ember';

export default Ember.Route.extend({
  model: function(){
    return this.modelFor('program').get('programYears');
  },
  setupController: function(controller, model){
    controller.set('model', model);
    controller.set('program', this.modelFor('program'));
  }
});
