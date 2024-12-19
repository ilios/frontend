import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { map } from 'rsvp';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { TrackedAsyncData } from 'ember-async-data';
import PapaParse from 'papaparse';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import { findById, mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeInstructorsGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'minutes';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.args.course));
  }

  get isLoaded() {
    return this.outputData.isResolved;
  }

  get data() {
    return this.outputData.isResolved ? this.outputData.value : [];
  }

  get hasData() {
    return this.data.length;
  }

  get chartData() {
    return this.data.filter((obj) => obj.data);
  }

  get filteredChartData() {
    return this.filterData(this.chartData);
  }

  get hasChartData() {
    return this.filteredChartData.length;
  }

  get filteredData() {
    return this.filterData(this.data);
  }

  get tableData() {
    return this.filteredData.map((obj) => {
      const rhett = {};
      rhett.minutes = obj.data;
      rhett.sessions = sortBy(obj.meta.sessions, 'title');
      rhett.instructor = obj.meta.user;
      rhett.instructorName = obj.meta.user.fullName;
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

  filterData(data) {
    const q = cleanQuery(this.args.filter);
    if (q) {
      const exp = new RegExp(q, 'gi');
      return data.filter(({ label }) => label.match(exp));
    }
    return data;
  }

  async getData(course) {
    const sessions = await course.sessions;
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
      .reduce((set, { session, instructorsWithInstructionalTime }) => {
        instructorsWithInstructionalTime.forEach(({ instructor, minutes }) => {
          const id = instructor.id;
          let existing = findById(set, id);
          if (!existing) {
            existing = {
              id,
              data: 0,
              label: instructor.fullName,
              meta: {
                user: instructor,
                sessions: [],
              },
            };
            set.push(existing);
          }
          existing.data += minutes;
          existing.meta.sessions.push(session);
        });
        return set;
      }, [])
      .map((obj) => {
        obj.description = `${obj.meta.user.fullName} - ${obj.data} ${this.intl.t('general.minutes')}`;
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

  downloadData = dropTask(async () => {
    const data = await this.getData(this.args.course);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[`${this.intl.t('general.instructor')}`] = obj.meta.user.fullName;
      rhett[this.intl.t('general.sessions')] = mapBy(obj.meta.sessions, 'title').sort().join(', ');
      rhett[this.intl.t('general.minutes')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(`ilios-course-${this.args.course.id}-instructors.csv`, csv, 'text/csv');
  });
}
