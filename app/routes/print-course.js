import Ember from 'ember';

export default Ember.Route.extend({
  beforeModel: function(){
    this.controllerFor('application').set('showHeader', false);
    this.controllerFor('application').set('showNavigation', false);
  },
  renderTemplate: function() {
    this.render({ outlet: 'fullscreen' });
  }
});
