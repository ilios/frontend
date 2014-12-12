import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function(){
    this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.programs'));
  }
});
