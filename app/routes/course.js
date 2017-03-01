import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Ember.Route.extend(AuthenticatedRouteMixin, {
  titleToken: 'general.coursesAndSessions',
  setupController: function(controller, model){
    controller.set('model', model);
    this.controllerFor('course').set('showBackToCourseListLink', true);
  }
});
