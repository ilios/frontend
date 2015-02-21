import Ember from 'ember';

export default Ember.Route.extend({
  availableTopics: [],
  program: [],
  sessionTypes: [],
  course: null,
  afterModel: function(session){
    var self = this;
    var deferred = Ember.RSVP.defer();
    Ember.run.later(deferred.resolve, function() {
      var resolve = this;
      session.get('course').then(function(course){
        self.set('course', course);
        course.get('owningSchool').then(function(school){
          var promises = {
            'availableTopics': school.get('disciplines'),
            'programs': self.store.find('program'),
            'sessionTypes': self.store.find('sessionType'),
          };
          Ember.RSVP.hash(promises).then(function(hash){
            if(!self.get('isDestroyed')){
              self.set('availableTopics', hash.availableTopics);
              self.set('programs', hash.programs);
              self.set('sessionTypes', hash.sessionTypes);
            }
            resolve();
          });
        });
      });
    }, 500);
    return deferred.promise;
  },
  setupController: function(controller, model){
    if(!controller.get('isDestroyed')){
      controller.set('model', model);
      controller.set('course', this.get('course'));
      controller.set('availableTopics', this.get('availableTopics'));
      controller.set('programs', this.get('programs'));
      controller.set('sessionTypes', this.get('sessionTypes'));
      this.controllerFor('application').set('pageTitle', Ember.I18n.t('navigation.courses'));
    }
  }
});
