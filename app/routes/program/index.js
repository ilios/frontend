import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

import config from 'ilios/config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Route.extend(AuthenticatedRouteMixin, {
  permissionChecker: service(),
  canCreate: false,
  async afterModel(program) {
    const permissionChecker = this.get('permissionChecker');

    let canCreate = true;
    if (enforceRelationshipCapabilityPermissions) {
      canCreate = await permissionChecker.canCreateProgramYear(program);
    }

    this.set('canCreate', canCreate);

    await all([
      program.get('programYears'),
      program.get('allPublicationIssuesLength')
    ]);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canCreate', this.get('canCreate'));
  }
});
