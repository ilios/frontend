import Mixin from '@ember/object/mixin';
import { all, map } from 'rsvp';
import { inject as service } from '@ember/service';

export default Mixin.create({
  store: service(),
  titleToken: 'general.coursesAndSessions',
  async model(params) {
    const store = this.get('store');
    const course = await store.find('course', params.course_id);
    const term = await store.find('term', params.term_id);

    return { course, term };
  },
  async afterModel(model) {
    const { course, term } = model;
    const sessions = await course.get('sessions');
    return await all([
      term.get('vocabulary'),
      map(sessions.toArray(), s => s.get('sessionType')),
      map(sessions.toArray(), s => s.get('totalSumDuration')),
    ]);
  }
});
