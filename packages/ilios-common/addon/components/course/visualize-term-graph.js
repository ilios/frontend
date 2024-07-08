import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import {
  findBy,
  findById,
  mapBy,
  uniqueById,
  uniqueValues,
} from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeTermGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : null;
  }

  @cached
  get sessionTypesData() {
    if (!this.sessionsData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(Promise.all(this.sessionsData.value.map((s) => s.sessionType)));
  }

  get sessionTypes() {
    return this.sessionTypesData?.isResolved ? uniqueById(this.sessionTypesData.value) : null;
  }

  get isLoaded() {
    return !!this.sessionTypes;
  }

  get termSessionIds() {
    return this.args.term.hasMany('sessions').ids();
  }

  get termSessionsInCourse() {
    return this.sessions.filter((session) => this.termSessionIds.includes(session.id));
  }

  get data() {
    const sessionTypeData = this.termSessionsInCourse.map((session) => {
      const minutes = Math.round(session.totalSumDuration * 60);
      const sessionType = findById(this.sessionTypes, session.belongsTo('sessionType').id());
      return {
        sessionTitle: session.title,
        sessionTypeTitle: sessionType.title,
        minutes,
      };
    });

    const data = sessionTypeData.reduce((set, obj) => {
      let existing = findBy(set, 'label', obj.sessionTypeTitle);
      if (!existing) {
        existing = {
          data: 0,
          label: obj.sessionTypeTitle,
          meta: {
            sessionTypeTitle: obj.sessionTypeTitle,
            sessions: [],
          },
        };
        set.push(existing);
      }
      existing.data += obj.minutes;
      existing.meta.sessions.push(obj.sessionTitle);

      return set;
    }, []);

    const totalMinutes = mapBy(data, 'data').reduce((total, minutes) => total + minutes, 0);

    return data.map((obj) => {
      const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
      obj.label = `${obj.meta.sessionTypeTitle} ${percent}%`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
    });
  }

  barHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { label, data, meta } = obj;

    this.tooltipTitle = htmlSafe(`${label} ${data} ${this.intl.t('general.minutes')}`);
    this.tooltipContent = uniqueValues(meta.sessions).sort().join(', ');
  });
}
