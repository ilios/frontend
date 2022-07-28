import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { cleanQuery } from 'ilios-common/utils/query-utils';

import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class VisualizerCourseInstructors extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @use _sessions = new ResolveAsyncValue(() => [this.args.course.sessions]);

  get chartType() {
    return this.args.chartType || 'horz-bar';
  }

  get isLoaded() {
    return !!this._sessions;
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

  get sessions() {
    if (!this._sessions) {
      return [];
    }

    const sessionsWithLoadedInstructors = this._sessions.filter(
      (session) => session.allInstructors
    );

    return sessionsWithLoadedInstructors.map((session) => {
      const minutes = Math.round(session.maxSingleOfferingDuration * 60);
      return {
        sessionTitle: session.title,
        instructors: session.allInstructors,
        minutes,
      };
    });
  }

  get data() {
    const instructorData = this.sessions.reduce((set, obj) => {
      obj.instructors.forEach((instructor) => {
        const name = instructor.get('fullName');
        const id = instructor.get('id');
        let existing = set.findBy('label', name);
        if (!existing) {
          existing = {
            data: 0,
            label: name,
            meta: {
              userId: id,
              sessions: [],
            },
          };
          set.pushObject(existing);
        }
        existing.data += obj.minutes;
        existing.meta.sessions.pushObject(obj.sessionTitle);
      });

      return set;
    }, []);

    const totalMinutes = instructorData
      .mapBy('data')
      .reduce((total, minutes) => total + minutes, 0);
    return instructorData.map((obj) => {
      const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
      obj.label = `${obj.label} ${percent}%`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
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
    const sessions = meta.sessions.uniq().sort().join(', ');

    this.tooltipTitle = htmlSafe(`${label} ${data} ${this.intl.t('general.minutes')}`);
    this.tooltipContent = htmlSafe(sessions + '<br /><br />' + this.intl.t('general.clickForMore'));
  }

  @action
  barClick(obj) {
    if (this.args.isIcon || isEmpty(obj) || obj.empty || isEmpty(obj.meta)) {
      return;
    }

    this.router.transitionTo(
      'course-visualize-instructor',
      this.args.course.get('id'),
      obj.meta.userId
    );
  }
}
