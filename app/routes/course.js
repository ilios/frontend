import Ember from 'ember';

export default Ember.Route.extend({
  setupController: function(controller, model){
    this._super(controller, model);
    this.store.find('discipline').then(function(disciplines){
      controller.set('availableTopics', disciplines);
    });
    this.store.find('program').then(function(programs){
      controller.set('programs', programs);
    });
    this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.courses'));
  }
});
