import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import config from '../config/environment';

const { Route, inject } = Ember;
const { service } = inject;
const { IliosFeatures: { accessCourseVisualizations } } = config;

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
});
