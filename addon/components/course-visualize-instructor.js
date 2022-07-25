import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';
import { map, filter } from 'rsvp';

export default class CourseVisualizeInstructorComponent extends Component {
  @service iliosConfig;
  @tracked academicYearCrossesCalendarYearBoundaries = false;
  @tracked ilmMinutes = 0;
  @tracked offeringMinutes = 0;

  @restartableTask
  *load() {
    const sessions = yield this.args.course.sessions;
    const sessionsWithUser = yield filter(sessions.toArray(), async (session) => {
      const instructors = await session.getAllInstructors();
      return instructors.mapBy('id').includes(this.args.user.id);
    });

    const minutes = yield map(sessionsWithUser, async (session) => {
      const offeringMinutes = await session.getTotalSumOfferingsDurationByInstructor(
        this.args.user
      );
      const ilmMinutes = await session.getTotalSumIlmDurationByInstructor(this.args.user);
      return {
        offeringMinutes,
        ilmMinutes,
      };
    });
    this.offeringMinutes = minutes
      .mapBy('offeringMinutes')
      .reduce((total, mins) => total + mins, 0);
    this.ilmMinutes = minutes.mapBy('ilmMinutes').reduce((total, mins) => total + mins, 0);

    this.academicYearCrossesCalendarYearBoundaries = yield this.iliosConfig.itemFromConfig(
      'academicYearCrossesCalendarYearBoundaries'
    );
  }
}
