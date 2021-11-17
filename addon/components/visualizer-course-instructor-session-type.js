import Component from '@glimmer/component';
import { map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class VisualizerCourseInstructorSessionType extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @use sessions = new ResolveAsyncValue(() => [this.args.course.sessions, []]);
  @use sessionsWithSessionType = new AsyncProcess(() => [
    this.getSessionsWithSessionsTypes.bind(this),
    this.sessions,
  ]);
  async getSessionsWithSessionsTypes(sessions) {
    return map(sessions.toArray(), async (session) => {
      const sessionType = await session.sessionType;
      return {
        session,
        sessionType,
      };
    });
  }

  get isLoaded() {
    return !!this.sessionsWithSessionType;
  }

  get data() {
    const sessionsWithUser = this.sessionsWithSessionType.filter(({ session }) => {
      return session.allInstructors?.mapBy('id').includes(this.args.user.id);
    });

    const dataMap = sessionsWithUser.map(({ session, sessionType }) => {
      const minutes = Math.round(session.totalSumDuration * 60);

      return {
        sessionTitle: session.title,
        sessionTypeTitle: sessionType.title,
        minutes,
      };
    });

    const sessionTypeData = dataMap.reduce((set, obj) => {
      const name = obj.sessionTypeTitle;
      let existing = set.findBy('label', name);
      if (!existing) {
        existing = {
          data: 0,
          label: name,
          meta: {
            sessions: [],
          },
        };
        set.pushObject(existing);
      }
      existing.data += obj.minutes;
      existing.meta.sessions.pushObject(obj.sessionTitle);

      return set;
    }, []);

    const totalMinutes = sessionTypeData
      .mapBy('data')
      .reduce((total, minutes) => total + minutes, 0);
    return sessionTypeData.map((obj) => {
      const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
      obj.label = `${obj.label} ${percent}%`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
    });
  }

  @restartableTask
  *donutHover(obj) {
    yield timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { label, data, meta } = obj;

    this.tooltipTitle = htmlSafe(`${label} ${data} ${this.intl.t('general.minutes')}`);
    this.tooltipContent = meta.sessions.uniq().sort().join();
  }
}
