import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

import config from '../config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Route.extend(AuthenticatedRouteMixin, {
  permissionChecker: service(),
  titleToken: 'general.coursesAndSessions',
  editable: false,
  async afterModel(course) {
    const permissionChecker = this.get('permissionChecker');
    const schoolId = course.belongsTo('school').id();

    let editable;
    if (!enforceRelationshipCapabilityPermissions) {
      editable = !course.get('locked') && !course.get('archived');
    } else {
      editable = await permissionChecker.canUpdateCourse(course, schoolId);
    }

    this.set('editable', editable);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('editable', this.get('editable'));
  }
});
