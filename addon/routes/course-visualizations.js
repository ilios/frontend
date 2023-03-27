import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all } from 'rsvp';
import { mapBy } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizationsRoute extends Route {
  @service store;
  @service session;
  @service dataLoader;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    return this.dataLoader.loadCourse(params.course_id);
  }

  /**
   * Prefetch related data to limit network requests
   */
  afterModel(model) {
    const courses = [model.get('id')];
    const course = model.get('id');
    const sessions = model.hasMany('sessions').ids();
    const existingSessionsInStore = this.store.peekAll('session');
    const existingSessionIds = mapBy(existingSessionsInStore, 'id');
    const unloadedSessions = sessions.filter((id) => !existingSessionIds.includes(id));

    //if we have already loaded all of these sessions we can just proceed normally
    if (unloadedSessions.length === 0) {
      return;
    }

    const promises = [
      this.store.query('session', { filters: { course } }),
      this.store.query('offering', { filters: { courses } }),
      this.store.query('ilm-session', { filters: { courses } }),
      this.store.query('course-objective', { filters: { courses } }),
    ];
    const maximumSessionLoad = 100;
    if (sessions.length < maximumSessionLoad) {
      promises.push(this.store.query('session-objective', { filters: { sessions } }));
      promises.push(this.store.query('session-type', { filters: { sessions } }));
      promises.push(this.store.query('term', { filters: { sessions } }));
    } else {
      for (let i = 0; i < sessions.length; i += maximumSessionLoad) {
        const slice = sessions.slice(i, i + maximumSessionLoad);
        promises.push(
          this.store.query('session-objective', {
            filters: { sessions: slice },
          })
        );
        promises.push(this.store.query('session-type', { filters: { sessions: slice } }));
        promises.push(this.store.query('term', { filters: { sessions: slice } }));
      }
    }

    return all(promises);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
