import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all } from 'rsvp';

export default class SessionIndexRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service permissionChecker;
  @service store;

  canUpdate = false;

  /**
   * Preload the school configurations
   * to avoid a pop in later
   */
  async afterModel(session) {
    const course = await session.course;
    const school = await course.school;
    await school.configurations;
    this.canUpdate = await this.permissionChecker.canUpdateSession(session);

    const sessions = course.hasMany('sessions').ids();
    const existingSessionsInStore = this.store.peekAll('session');
    const existingSessionIds = existingSessionsInStore.mapBy('id');
    const unloadedSessions = sessions.filter(id => !existingSessionIds.includes(id));

    const promises = [
      session.description,
      session.administrators,
      session.objectives,
      session.learningMaterials,
      session.terms,
      session.offerings,
    ];
    //if we have already loaded all of these sessions we can just proceed normally
    if (unloadedSessions.length > 0) {
      promises.pushObjects([
        this.store.query('session', { filters: { course: course.id } }),
        this.store.query('ilm-session', { filters: { courses: [course.id] } }),
        this.store.query('offering', { filters: { courses: [course.id] } }),
      ]);
    }

    return all(promises);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
  }
}
