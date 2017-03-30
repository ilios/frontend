import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import config from '../config/environment';

const { Route, RSVP, inject } = Ember;
const { service } = inject;
const { IliosFeatures: { accessCourseVisualizations } } = config;
const { all, map } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  titleToken: 'general.coursesAndSessions',
  accessCourseVisualizations,
  beforeModel(){
    this._super(...arguments);
    const accessCourseVisualizations = this.get('accessCourseVisualizations');
    if (!accessCourseVisualizations) {
      this.transitionTo('index');
    }
  },
  async afterModel(course){
    const sessions = await course.get('sessions');
    return await all([
      course.get('objectives'),
      map(sessions.toArray(), s => s.get('objectives')),
      map(sessions.toArray(), s => s.get('offerings')),
    ]);
  }
});
