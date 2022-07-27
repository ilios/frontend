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

export default class VisualizerCourseSessionType extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @use sessions = new ResolveAsyncValue(() => [this.args.course.sessions, []]);
  @use sessionTypeSessions = new ResolveAsyncValue(() => [this.args.sessionType.sessions, []]);
  @use dataObjects = new AsyncProcess(() => [
    this.getDataObjects.bind(this),
    this.sessionsAndSessionTypeSessions,
  ]);

  get sessionsAndSessionTypeSessions() {
    const rhett = {
      sessions: [],
      sessionTypeSessions: [],
    };
    if (this.sessions && this.sessionTypeSessions) {
      rhett.sessions = this.sessions.toArray();
      rhett.sessionTypeSessions = this.sessionTypeSessions.toArray();
    }
    return rhett;
  }

  async getDataObjects(sessionsAndSessionTypeSessions) {
    const sessions = sessionsAndSessionTypeSessions.sessions;
    const sessionTypeSessions = sessionsAndSessionTypeSessions.sessionTypeSessions;
    const courseSessionsWithSessionType = sessions.filter((session) =>
      sessionTypeSessions.includes(session)
    );

    const sessionsWithMinutes = map(courseSessionsWithSessionType, async (session) => {
      const hours = await session.getTotalSumDuration();
      return {
        session,
        minutes: Math.round(hours * 60),
      };
    });

    const termData = await map(sessionsWithMinutes, async ({ session, minutes }) => {
      const terms = (await session.terms).toArray();
      return map(terms, async (term) => {
        const vocabulary = await term.vocabulary;
        return {
          sessionTitle: session.title,
          termTitle: term.title,
          vocabularyTitle: vocabulary.title,
          minutes,
        };
      });
    });

    return termData.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);
  }

  get data() {
    const data = this.dataObjects.reduce((set, obj) => {
      const label = obj.vocabularyTitle + ' - ' + obj.termTitle;
      let existing = set.findBy('label', label);
      if (!existing) {
        existing = {
          data: 0,
          label,
          meta: {
            vocabularyTitle: obj.vocabularyTitle,
            sessions: [],
          },
        };
        set.pushObject(existing);
      }
      existing.data += obj.minutes;
      existing.meta.sessions.pushObject(obj.sessionTitle);

      return set;
    }, []);

    const totalMinutes = data.mapBy('data').reduce((total, minutes) => total + minutes, 0);
    return data
      .map((obj) => {
        const percent = ((obj.data / totalMinutes) * 100).toFixed(1);
        obj.label = `${obj.label}: ${obj.data} ${this.intl.t('general.minutes')}`;
        obj.meta.totalMinutes = totalMinutes;
        obj.meta.percent = percent;
        return obj;
      })
      .sort((first, second) => {
        return (
          first.meta.vocabularyTitle.localeCompare(second.meta.vocabularyTitle) ||
          first.data - second.data
        );
      });
  }

  get isLoaded() {
    return !!this.dataObjects;
  }

  @restartableTask
  *barHover(obj) {
    yield timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { label, meta } = obj;

    this.tooltipTitle = htmlSafe(label);
    this.tooltipContent = meta.sessions.uniq().sort().join(', ');
  }
}
