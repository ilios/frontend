import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { map } from 'rsvp';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { TrackedAsyncData } from 'ember-async-data';
import { findById, mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeInstructorsGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'minutes';

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value.slice() : [];
  }

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.sessions));
  }

  get isLoaded() {
    return this.outputData.isResolved;
  }

  get data() {
    return this.outputData.isResolved ? this.outputData.value : [];
  }

  get tableData() {
    return this.filteredData.map((obj) => {
      const rhett = {};
      rhett.minutes = obj.data;
      rhett.sessions = obj.meta.sessions;
      rhett.instructor = obj.meta.user.fullName;
      rhett.sessionTitles = mapBy(rhett.sessions, 'title').join(', ');
      return rhett;
    });
  }

  get sortedAscending() {
    return this.sortBy.search(/desc/) === -1;
  }

  @action
  setSortBy(prop) {
    if (this.sortBy === prop) {
      prop += ':desc';
    }
    this.sortBy = prop;
  }

  get filteredData() {
    const q = cleanQuery(this.args.filter);
    if (q) {
      const exp = new RegExp(q, 'gi');
      return this.data.filter(({ label }) => label.match(exp));
    }
    return this.data;
  }

  async getData(sessions) {
    const sessionsWithInstructors = await map(sessions, async (session) => {
      const instructors = await session.getAllInstructors();
      const instructorsWithInstructionalTime = await map(instructors, async (instructor) => {
        const minutes = await session.getTotalSumOfferingsDurationByInstructor(instructor);
        return {
          instructor,
          minutes,
        };
      });
      return {
        session,
        instructorsWithInstructionalTime,
      };
    });

    return sessionsWithInstructors
      .reduce((set, obj) => {
        obj.instructorsWithInstructionalTime.forEach((instructorWithInstructionalTime) => {
          const id = instructorWithInstructionalTime.instructor.id;
          if (!instructorWithInstructionalTime.minutes) {
            return;
          }
          let existing = findById(set, id);
          if (!existing) {
            existing = {
              id,
              data: 0,
              label: instructorWithInstructionalTime.instructor.fullName,
              meta: {
                user: instructorWithInstructionalTime.instructor,
                sessions: [],
              },
            };
            set.push(existing);
          }
          existing.data += instructorWithInstructionalTime.minutes;
          existing.meta.sessions.push(obj.session);
        });
        return set;
      }, [])
      .map((obj) => {
        delete obj.id;
        return obj;
      })
      .sort((first, second) => {
        return first.data - second.data;
      });
  }

  barHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    this.tooltipTitle = htmlSafe(
      `${obj.meta.user.fullName} &bull; ${obj.data} ${this.intl.t('general.minutes')}`,
    );
    this.tooltipContent = htmlSafe(
      uniqueValues(mapBy(obj.meta.sessions, 'title')).sort().join(', '),
    );
  });

  @action
  barClick(obj) {
    if (this.args.isIcon || isEmpty(obj) || obj.empty || isEmpty(obj.meta)) {
      return;
    }

    this.router.transitionTo('course-visualize-instructor', this.args.course.id, obj.meta.user.id);
  }
}
