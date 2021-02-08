import Route from '@ember/routing/route';
import { all } from 'rsvp';
import { inject as service } from '@ember/service';

export default class LearnerGroupRoute extends Route {
  @service permissionChecker;
  @service session;

  editable = false;

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  async afterModel(model) {
    const permissionChecker = this.permissionChecker;

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
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.canUpdate);
    controller.set('canDelete', this.canDelete);
    controller.set('canCreate', this.canCreate);
  }
}
