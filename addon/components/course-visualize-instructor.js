import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { map, filter } from 'rsvp';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import { mapBy } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeInstructorComponent extends Component {
  @service iliosConfig;

  @use academicYearCrossesCalendarYearBoundaries = new ResolveAsyncValue(() => [
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  ]);

  @use sessions = new ResolveAsyncValue(() => [this.args.course.sessions]);
  @use minutes = new AsyncProcess(() => [this.getMinutes.bind(this), this.sessions]);

  get totalInstructionalTime() {
    if (!this.minutes) {
      return 0;
    }
    return mapBy(this.minutes, 'offeringMinutes').reduce((total, mins) => total + mins, 0);
  }

  get totalIlmTime() {
    if (!this.minutes) {
      return 0;
    }
    return mapBy(this.minutes, 'ilmMinutes').reduce((total, mins) => total + mins, 0);
  }

  async getMinutes(sessions) {
    if (!sessions) {
      return [];
    }

    const sessionsWithUser = await filter(sessions.slice(), async (session) => {
      const instructors = await session.getAllInstructors();
      return mapBy(instructors, 'id').includes(this.args.user.id);
    });

    return map(sessionsWithUser, async (session) => {
      const offeringMinutes = await session.getTotalSumOfferingsDurationByInstructor(
        this.args.user
      );
      const ilmMinutes = await session.getTotalSumIlmDurationByInstructor(this.args.user);
      return {
        offeringMinutes,
        ilmMinutes,
      };
    });
  }
}
