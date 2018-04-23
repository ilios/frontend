import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

import config from '../config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Route.extend(AuthenticatedRouteMixin, {
  permissionChecker: service(),
  titleToken: 'general.instructorGroups',
  canUpdate: false,
  async afterModel(instructorGroup) {
    const permissionChecker = this.get('permissionChecker');

    let canUpdate;
    if (!enforceRelationshipCapabilityPermissions) {
      canUpdate = true;
    } else {
      const school = await instructorGroup.get('school');
      canUpdate = await permissionChecker.canUpdateInstructorGroup(school);
    }

    this.set('canUpdate', canUpdate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
  }
});
