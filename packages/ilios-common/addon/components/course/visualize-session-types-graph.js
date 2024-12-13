import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { map } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import PapaParse from 'papaparse';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { findById, mapBy, sortBy, uniqueValues } from 'ilios-common/utils/array-helpers';
import createDownloadFile from 'ilios-common/utils/create-download-file';

export default class CourseVisualizeSessionTypesGraph extends Component {
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
      rhett.sessionType = obj.meta.sessionType;
      rhett.sessionTypeTitle = obj.meta.sessionType.title;
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

    if (!sessions.length) {
      return [];
    }

    const dataMap = await map(sessions, async (session) => {
      const hours = await session.getTotalSumDuration();
      const minutes = Math.round(hours * 60);
      const sessionType = await session.sessionType;
      return {
        session,
        sessionType,
        minutes,
      };
    });

    return dataMap
      .reduce((set, { sessionType, session, minutes }) => {
        const id = sessionType.id;
        let existing = findById(set, id);
        if (!existing) {
          existing = {
            id,
            data: 0,
            label: sessionType.title,
            meta: {
              sessionType,
              sessions: [],
            },
          };
          set.push(existing);
        }
        existing.data += minutes;
        existing.meta.sessions.push(session);

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

  barHover = restartableTask(async (obj) => {
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

  @action
  barClick(obj) {
    if (this.args.isIcon || !obj || obj.empty || !obj.meta) {
      return;
    }
    this.router.transitionTo(
      'course-visualize-session-type',
      this.args.course.id,
      obj.meta.sessionType.id,
    );
  }

  downloadData = dropTask(async () => {
    const data = await this.getData(this.args.course);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[this.intl.t('general.sessionType')] = obj.meta.sessionType.title;
      rhett[this.intl.t('general.sessions')] = mapBy(obj.meta.sessions, 'title').sort().join(', ');
      rhett[this.intl.t('general.minutes')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(`ilios-course-${this.args.course.id}-session-types.csv`, csv, 'text/csv');
  });
}
