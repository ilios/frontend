import Mixin from '@ember/object/mixin';
import { all, map } from 'rsvp';
import { inject as service } from '@ember/service';

export default Mixin.create({
  store: service(),
  titleToken: 'general.coursesAndSessions',
  async model(params) {
    const store = this.get('store');
    const course = await store.find('course', params.course_id);
    const sessionType = await store.find('session-type', params['session-type_id']);

    return { course, sessionType };
  },
  async afterModel(model) {
    const { course } = model;
    const sessions = await course.get('sessions');
    return await all([
      map(sessions.toArray(), s => s.get('sessionType')),
      map(sessions.toArray(), s => s.get('terms')),
      map(sessions.toArray(), s => s.get('totalSumDuration')),
    ]);
  }
});
