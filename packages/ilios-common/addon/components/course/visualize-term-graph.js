import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';

export default class CourseVisualizeTermGraph extends Component {
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
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  get termSessionIds() {
    return this.args.term.hasMany('sessions').ids();
  }

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getDataObjects(this.sessions, this.termSessionIds));
  }

  get data() {
    return this.outputData.isResolved ? this.outputData.value : [];
  }

  get isLoaded() {
    return this.outputData.isResolved;
  }

  get tableData() {
    return this.data.map((obj) => {
      const rhett = {};
      rhett.minutes = obj.data;
      rhett.sessions = obj.meta.sessions;
      rhett.sessionType = obj.meta.sessionType.title;
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

  async getDataObjects(sessions, termIds) {
    const filteredSessions = sessions.filter((session) => termIds.includes(session.id));
    const sessionTypes = await Promise.all(filteredSessions.map((s) => s.sessionType));
    const sessionTypeData = filteredSessions.map((session) => {
      const minutes = Math.round(session.totalSumDuration * 60);
      const sessionType = findById(sessionTypes, session.belongsTo('sessionType').id());
      return {
        session,
        sessionType,
        minutes,
      };
    });

    return sessionTypeData
      .reduce((set, obj) => {
        const id = obj.sessionType.id;
        let existing = findById(set, id);
        if (!existing) {
          existing = {
            id,
            data: 0,
            label: obj.sessionType.title,
            meta: {
              sessionType: obj.sessionType,
              sessions: [],
            },
          };
          set.push(existing);
        }
        existing.data += obj.minutes;
        existing.meta.sessions.push(obj.session);
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
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { data, meta } = obj;
    this.tooltipTitle = htmlSafe(
      `${meta.sessionType.title} &bull; ${data} ${this.intl.t('general.minutes')}`,
    );
    this.tooltipContent = mapBy(meta.sessions, 'title').sort().join(', ');
  });
}
