import Ember from 'ember';

export default Ember.Route.extend({
  renderTemplate: function() {
    this.render({ outlet: 'fullscreen' });
  },
  setupController: function(controller, model){
    controller.set('model', model);
    this.controllerFor('application').set('showHeader', false);
    this.controllerFor('application').set('showNavigation', false);
  }
});
