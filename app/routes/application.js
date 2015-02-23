import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function(controller){
    controller.set('pageTitle', '');
    controller.set('showHeader', true);
    controller.set('showNavigation', true);
  }
});
