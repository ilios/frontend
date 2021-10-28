import Component from '@glimmer/component';
import { map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { cleanQuery } from 'ilios-common/utils/query-utils';

export default class VisualizerCourseSessionTypes extends Component {
  @service router;
  @service intl;
  @tracked data;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  get chartType() {
    return this.args.chartType || 'horz-bar';
  }

  get filteredData() {
    if (!this.data) {
      return [];
    }

    let data = this.data;
    const q = cleanQuery(this.args.filter);
    if (q) {
      const exp = new RegExp(q, 'gi');
      data = this.data.filter(({ label }) => label.match(exp));
    }
    return data.sort((first, second) => {
      return first.data - second.data;
    });
  }

  @restartableTask
  *load(element, [course]) {
    const sessions = yield course.get('sessions');
    const dataMap = yield map(sessions.toArray(), async (session) => {
      const sessionType = await session.get('sessionType');
      const hours = await session.get('totalSumDuration');
      const minutes = Math.round(hours * 60);
      return {
        sessionTitle: session.get('title'),
        sessionTypeTitle: sessionType.get('title'),
        sessionTypeId: sessionType.get('id'),
        minutes,
      };
    });

    const mappedSessionTypes = dataMap.reduce((set, obj) => {
      let existing = set.findBy('label', obj.sessionTypeTitle);
      if (!existing) {
        existing = {
          data: 0,
          label: obj.sessionTypeTitle,
          meta: {
            sessionType: obj.sessionTypeTitle,
            sessionTypeId: obj.sessionTypeId,
            sessions: [],
          },
        };
        set.pushObject(existing);
      }
      existing.data += obj.minutes;
      existing.meta.sessions.pushObject(obj.sessionTitle);

      return set;
    }, []);

    const totalMinutes = mappedSessionTypes
      .mapBy('data')
      .reduce((total, minutes) => total + minutes, 0);
    this.data = mappedSessionTypes
      .map((obj) => {
        const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
        obj.label = `${obj.meta.sessionType} ${percent}%`;
        obj.meta.totalMinutes = totalMinutes;
        obj.meta.percent = percent;
        return obj;
      })
      .sort((first, second) => {
        return first.data - second.data;
      });
  }

  @restartableTask
  *barHover(obj) {
    yield timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { label, data, meta } = obj;

    const title = htmlSafe(`${label} ${data} ${this.intl.t('general.minutes')}`);
    const sessions = meta.sessions.uniq().sort().join();

    this.tooltipTitle = title;
    this.tooltipContent = sessions;
  }

  @action
  barClick(obj) {
    if (this.args.isIcon || isEmpty(obj) || obj.empty || isEmpty(obj.meta)) {
      return;
    }
    this.router.transitionTo(
      'course-visualize-session-type',
      this.args.course.get('id'),
      obj.meta.sessionTypeId
    );
  }
}
