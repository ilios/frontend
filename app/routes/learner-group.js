import Route from '@ember/routing/route';
import { all } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

import config from '../config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

export default Route.extend(AuthenticatedRouteMixin, {
  permissionChecker: service(),
  editable: false,
  titleToken: 'general.learnerGroups',
  async afterModel(model) {
    const permissionChecker = this.get('permissionChecker');

    let canUpdate;
    let canDelete;
    let canCreate;
    if (!enforceRelationshipCapabilityPermissions) {
      canUpdate = true;
      canDelete = true;
      canCreate = true;
    } else {
      const school = await model.get('school');
      canUpdate = await permissionChecker.canUpdateLearnerGroup(model);
      canDelete = await permissionChecker.canDeleteLearnerGroup(model);
      canCreate = await permissionChecker.canCreateLearnerGroup(school);
    }

    this.set('canUpdate', canUpdate);
    this.set('canDelete', canDelete);
    this.set('canCreate', canCreate);

    //preload data to speed up rendering later
    return all([
      model.get('usersOnlyAtThisLevel'),
      model.get('allInstructors'),
      model.get('allParents'),
      model.get('courses'),
    ]);
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
    controller.set('canDelete', this.get('canDelete'));
    controller.set('canCreate', this.get('canCreate'));
  }
});
