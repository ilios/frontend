import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

import config from '../config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Route.extend(AuthenticatedRouteMixin, {
  permissionChecker: service(),
  titleToken: 'general.programs',
  canUpdate: false,
  async afterModel(program) {
    const permissionChecker = this.get('permissionChecker');

    let canUpdate = true;
    if (enforceRelationshipCapabilityPermissions) {
      canUpdate = await permissionChecker.canUpdateProgram(program);
    }

    this.set('canUpdate', canUpdate);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
  }
});
