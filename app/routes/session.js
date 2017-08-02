import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  sessionTypes: [],
  afterModel() {
    var self = this;
    var course = this.modelFor('course');
    var deferred = Ember.RSVP.defer();
    Ember.run.later(deferred.resolve, function() {
      var resolve = this;
      course.get('school').then(function(school){
        school.get('sessionTypes').then(function(sessionTypes){
          self.set('sessionTypes', sessionTypes);
          resolve();
        });
      });

    }, 500);
    return deferred.promise;
  },
  setupController(controller, model) {
    controller.set('model', model);
    controller.set('sessionTypes', this.get('sessionTypes'));
    this.controllerFor('course').set('showBackToCourseListLink', false);
  }
});
