import Ember from 'ember';

export default Ember.Route.extend({
  availableTopics: [],
  program: [],
  afterModel: function(course){
    var self = this;
    var deferred = Ember.RSVP.defer();
    Ember.run.later(deferred.resolve, function() {
      var resolve = this;
      course.get('owningSchool').then(function(school){
        var promises = {
          'availableTopics': school.get('disciplines'),
          'programs': self.store.find('program')
        };
        Ember.RSVP.hash(promises).then(function(hash){
          if(!self.get('isDestroyed')){
            self.set('availableTopics', hash.availableTopics);
            self.set('programs', hash.programs);
          }
          resolve();
        });
      });

    }, 500);
    return deferred.promise;
  },
  setupController: function(controller, model){
    var self = this;
    Ember.run.later(function(){
      if(!controller.get('isDestroyed')){
        controller.set('model', model);
        controller.set('availableTopics', self.get('availableTopics'));
        controller.set('programs', self.get('programs'));
        self.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.courses'));
      }
    });
  }
});
