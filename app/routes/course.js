import Ember from 'ember';

export default Ember.Route.extend({
  model: function(params){
    var promises = {
      model: this.store.find('course', params.course_id),
      availableTopics: this.store.find('discipline')
    };

    return Ember.RSVP.hash(promises);
  },
  setupController: function(controller, hash){
    controller.set('model', hash.model);
    controller.set('availableTopics', hash.availableTopics);
    this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.courses'));
  }
});
