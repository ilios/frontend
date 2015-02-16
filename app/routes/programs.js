import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function(){
    var self = this;
    Ember.run.later(function(){
      self.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.programs'));
    });

  }
});
