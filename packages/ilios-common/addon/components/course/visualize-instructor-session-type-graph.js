import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findById, mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';

export default class CourseVisualizeInstructorSessionTypeGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'minutes';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.args.course, this.args.user));
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

  get hasChartData() {
    return this.chartData.length;
  }

  get tableData() {
    return this.data.map((obj) => {
      const rhett = {};
      rhett.minutes = obj.data;
      rhett.sessions = sortBy(obj.meta.sessions, 'title');
      rhett.sessionType = obj.meta.sessionType.title;
      rhett.sessionTitles = mapBy(rhett.sessions, 'title').join(', ');
      return rhett;
    });
  }

  get isLoaded() {
    return this.outputData.isResolved;
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

  async getData(course, user) {
    const sessions = await course.sessions;
    if (!sessions.length) {
      return [];
    }

    const sessionsWithUser = await filter(sessions, async (session) => {
      const allInstructors = await session.getAllOfferingInstructors();
      return mapBy(allInstructors, 'id').includes(user.id);
    });

    const sessionsWithSessionType = await map(sessionsWithUser, async (session) => {
      const sessionType = await session.sessionType;
      return {
        session,
        sessionType,
      };
    });

    const dataMap = await map(sessionsWithSessionType, async ({ session, sessionType }) => {
      const minutes = await session.getTotalSumDurationByInstructor(this.args.user);
      return {
        session,
        sessionType,
        minutes,
      };
    });

    return dataMap
      .reduce((set, obj) => {
        const id = obj.sessionType.id;
        let existing = findById(set, id);
        if (!existing) {
          existing = {
            id,
            data: 0,
            label: obj.sessionType.title,
            meta: {
              sessions: [],
              sessionType: obj.sessionType,
            },
          };
          set.push(existing);
        }
        existing.data += obj.minutes;
        existing.meta.sessions.push(obj.session);

        return set;
      }, [])
      .map((obj) => {
        obj.description = `${obj.meta.sessionType.title} - ${obj.data} ${this.intl.t('general.minutes')}`;
        delete obj.id;
        return obj;
      })
      .sort((first, second) => {
        return first.data - second.data;
      });
  }

  donutHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { data, meta } = obj;
    this.tooltipTitle = htmlSafe(
      `${meta.sessionType.title} &bull; ${data} ${this.intl.t('general.minutes')}`,
    );
    this.tooltipContent = htmlSafe(uniqueValues(mapBy(meta.sessions, 'title')).sort().join(', '));
  });
}
