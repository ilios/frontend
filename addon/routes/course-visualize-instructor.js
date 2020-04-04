import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { all, map, filter } from 'rsvp';

export default class CourseVisualizeInstructorRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service store;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    const course = await this.store.find('course', params.course_id);
    const user = await this.store.find('user', params.user_id);

    const sessions = await course.get('sessions');
    const sessionsWithUser = await filter(sessions.toArray(), async session => {
      const instructors = await session.get('allInstructors');
      return instructors.mapBy('id').includes(user.get('id'));
    });

    const minutes = await map(sessionsWithUser, async session => {
      const offeringHours = await session.get('maxSingleOfferingDuration');
      const ilmSession = await session.get('ilmSession');
      const offeringMinutes = Math.round(offeringHours * 60);
      let ilmMinutes = 0;
      if (ilmSession) {
        ilmMinutes = Math.round(parseFloat(ilmSession.get('hours')) * 60);
      }
      return {
        offeringMinutes,
        ilmMinutes
      };
    });
    const offeringMinutes = minutes.mapBy('offeringMinutes').reduce((total, mins) => total + mins, 0);
    const ilmMinutes = minutes.mapBy('ilmMinutes').reduce((total, mins) => total + mins, 0);

    return { course, user, offeringMinutes, ilmMinutes };
  }

  async afterModel({ course }) {
    const sessions = (await course.sessions).toArray();
    return await all([
      course.school,
      map(sessions, s => s.sessionType),
      map(sessions, s => s.allInstructors),
      map(sessions, s => s.totalSumDuration),
    ]);
  }
}
