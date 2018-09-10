import Mixin from '@ember/object/mixin';
import { all, map } from 'rsvp';
import { inject as service } from '@ember/service';

export default Mixin.create({
  store: service(),
  titleToken: 'general.coursesAndSessions',
  async afterModel(course){
    const sessions = await course.get('sessions');
    return await all([
      course.get('objectives'),
      map(sessions.toArray(), s => s.get('objectives')),
      map(sessions.toArray(), s => s.get('totalSumDuration')),
    ]);
  }
});
