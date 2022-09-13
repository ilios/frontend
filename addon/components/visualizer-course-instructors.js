import Component from '@glimmer/component';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { map } from 'rsvp';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { cleanQuery } from 'ilios-common/utils/query-utils';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import { findBy, mapBy, uniqueValues } from '../utils/array-helpers';

export default class VisualizerCourseInstructors extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @use sessions = new ResolveAsyncValue(() => [this.args.course.sessions]);
  @use loadedData = new AsyncProcess(() => [this.getData.bind(this), this.sessions]);

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

  get data() {
    if (!this.loadedData) {
      return [];
    }
    return this.loadedData;
  }

  async getData() {
    if (!this.sessions) {
      return [];
    }

    const sessionsWithInstructors = await map(this.sessions.slice(), async (session) => {
      const instructors = await session.getAllInstructors();
      const totalInstructionalTime = await session.getTotalSumOfferingsDuration();
      const instructorsWithInstructionalTime = await map(instructors, async (instructor) => {
        const minutes = await session.getTotalSumOfferingsDurationByInstructor(instructor);
        return {
          instructor,
          minutes,
        };
      });
      return {
        sessionTitle: session.title,
        totalInstructionalTime: Math.round(totalInstructionalTime * 60),
        instructorsWithInstructionalTime,
      };
    });

    const instructorData = sessionsWithInstructors.reduce((set, obj) => {
      obj.instructorsWithInstructionalTime.forEach((instructorWithInstructionalTime) => {
        const name = instructorWithInstructionalTime.instructor.get('fullName');
        const id = instructorWithInstructionalTime.instructor.get('id');
        let existing = findBy(set, 'label', name);
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
        existing.data += instructorWithInstructionalTime.minutes;
        existing.meta.sessions.pushObject(obj.sessionTitle);
      });

      return set;
    }, []);

    const totalMinutes = mapBy(sessionsWithInstructors, 'totalInstructionalTime').reduce(
      (total, minutes) => total + minutes,
      0
    );
    return instructorData.map((obj) => {
      const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
      obj.label = `${obj.label}: ${obj.data} ${this.intl.t('general.minutes')}`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
    });
  }

  barHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { label, meta } = obj;
    const sessions = uniqueValues(meta.sessions).sort().join(', ');
    this.tooltipTitle = htmlSafe(label);
    this.tooltipContent = htmlSafe(sessions + '<br /><br />' + this.intl.t('general.clickForMore'));
  });

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
