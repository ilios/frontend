import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  titleToken: 'general.coursesAndSessions',
  setupController(controller, model) {
    controller.set('model', model);
    this.controllerFor('course').set('showBackToCourseListLink', true);
  }
});
