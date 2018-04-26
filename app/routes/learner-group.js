import Route from '@ember/routing/route';
import { all } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { inject as service } from '@ember/service';

export default Route.extend(AuthenticatedRouteMixin, {
  permissionChecker: service(),
  editable: false,
  titleToken: 'general.learnerGroups',
  async afterModel(model) {
    const permissionChecker = this.get('permissionChecker');

    const school = await model.get('school');
    const canUpdate = await permissionChecker.canUpdateLearnerGroup(model);
    const canDelete = await permissionChecker.canDeleteLearnerGroup(model);
    const canCreate = await permissionChecker.canCreateLearnerGroup(school);

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
