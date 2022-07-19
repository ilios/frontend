import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all, map, filter } from 'rsvp';
import moment from 'moment';

export default class CourseVisualizeInstructorRoute extends Route {
  @service session;
  @service store;

  titleToken = 'general.coursesAndSessions';

  async model(params) {
    const course = await this.store.find('course', params.course_id);
    const user = await this.store.find('user', params.user_id);

    const sessions = await course.sessions;
    const sessionsWithUser = await filter(sessions.toArray(), async (session) => {
      const instructors = await session.getAllInstructors();
      return instructors.mapBy('id').includes(user.id);
    });

    const minutes = await map(sessionsWithUser, async (session) => {
      const offerings = await session.offerings;
      const offeringsWithUser = await filter(offerings.toArray(), async (offering) => {
        const instructors = await offering.getAllInstructors();
        return instructors.mapBy('id').includes(user.id);
      });
      const offeringHours = offeringsWithUser
        .reduce((total, offering) => {
          return total + moment(offering.endDate).diff(moment(offering.startDate), 'hours', true);
        }, 0)
        .toFixed(2);
      const ilmSession = await session.ilmSession;
      const offeringMinutes = Math.round(offeringHours * 60);
      let ilmMinutes = 0;
      if (ilmSession) {
        ilmMinutes = Math.round(parseFloat(ilmSession.hours) * 60);
      }
      return {
        offeringMinutes,
        ilmMinutes,
      };
    });
    const offeringMinutes = minutes
      .mapBy('offeringMinutes')
      .reduce((total, mins) => total + mins, 0);
    const ilmMinutes = minutes.mapBy('ilmMinutes').reduce((total, mins) => total + mins, 0);

    return { course, user, offeringMinutes, ilmMinutes };
  }

  async afterModel({ course }) {
    const sessions = (await course.sessions).toArray();
    return await all([
      course.school,
      map(sessions, (s) => s.sessionType),
      map(sessions, (s) => s.getAllInstructors()),
      map(sessions, (s) => s.getTotalSumDuration()),
    ]);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
