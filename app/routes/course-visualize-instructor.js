import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all, map, filter } from 'rsvp';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  titleToken: 'general.coursesAndSessions',
  async model(params) {
    const store = this.get('store');
    const course = await store.find('course', params.course_id);
    const user = await store.find('user', params.user_id);

    const sessions = await course.get('sessions');
    const sessionsWithUser = await filter(sessions.toArray(), async session => {
      const instructors = await session.get('allInstructors');
      return instructors.mapBy('id').includes(user.get('id'));
    });

    const minutes = await map(sessionsWithUser, async session => {
      const totalHours = await session.get('totalSumOfferingsDuration');
      const offeringHours = await session.get('maxSingleOfferingDuration');
      const offeringMinutes = Math.round(offeringHours * 60);
      const totalMinutes = Math.round(totalHours * 60);
      const ilmMinutes = totalMinutes - offeringMinutes;

      return {
        offeringMinutes,
        ilmMinutes
      };
    });
    const offeringMinutes = minutes.mapBy('offeringMinutes').reduce((total, minutes) => total + minutes, 0);
    const ilmMinutes = minutes.mapBy('ilmMinutes').reduce((total, minutes) => total + minutes, 0);

    return { course, user, offeringMinutes, ilmMinutes };
  },
  async afterModel({ course }) {
    const sessions = await course.get('sessions');
    return await all([
      course.get('school'),
      map(sessions.toArray(), s => s.get('sessionType')),
      map(sessions.toArray(), s => s.get('allInstructors')),
      map(sessions.toArray(), s => s.get('totalSumOfferingsDuration')),
    ]);
  }
});
