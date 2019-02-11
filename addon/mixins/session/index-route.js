import Mixin from '@ember/object/mixin';
import { inject as service } from '@ember/service';
import { all } from 'rsvp';

export default Mixin.create({
  permissionChecker: service(),
  store: service(),
  canUpdate: false,
  /**
   * Preload the school configurations
   * to avoid a pop in later
   */
  async afterModel(session){
    const permissionChecker = this.get('permissionChecker');

    const course = await session.course;
    const school = await course.school;
    await school.configurations;
    const canUpdate = await permissionChecker.canUpdateSession(session);
    this.set('canUpdate', canUpdate);

    const sessions = course.hasMany('sessions').ids();
    const existingSessionsInStore = this.store.peekAll('session');
    const existingSessionIds = existingSessionsInStore.mapBy('id');
    const unloadedSessions = sessions.filter(id => !existingSessionIds.includes(id));

    let promises = [
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
  },
  setupController(controller, model) {
    this._super(controller, model);
    controller.set('canUpdate', this.get('canUpdate'));
  },
});
