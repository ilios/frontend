import Component from '@glimmer/component';
import { service } from '@ember/service';
import { map, filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { mapBy } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeInstructorComponent extends Component {
  @service iliosConfig;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : null;
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  @cached
  get minutesData() {
    return new TrackedAsyncData(this.getMinutes(this.sessions));
  }

  get minutes() {
    return this.minutesData.isResolved ? this.minutesData.value : [];
  }

  get totalInstructionalTime() {
    return mapBy(this.minutes, 'offeringMinutes').reduce((total, mins) => total + mins, 0);
  }

  get totalIlmTime() {
    return mapBy(this.minutes, 'ilmMinutes').reduce((total, mins) => total + mins, 0);
  }

  async getMinutes(sessions) {
    const sessionsWithUser = await filter(sessions, async (session) => {
      const instructors = await session.getAllInstructors();
      return mapBy(instructors, 'id').includes(this.args.user.id);
    });

    return map(sessionsWithUser, async (session) => {
      const offeringMinutes = await session.getTotalSumOfferingsDurationByInstructor(
        this.args.user,
      );
      const ilmMinutes = await session.getTotalSumIlmDurationByInstructor(this.args.user);
      return {
        offeringMinutes,
        ilmMinutes,
      };
    });
  }
}
