import Component from '@glimmer/component';
import { map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeSessionTypeGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.course.sessions);
  }

  @cached
  get sessionTypeSessionsData() {
    return new TrackedAsyncData(this.args.sessionType.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  get sessionTypeSessions() {
    return this.sessionTypeSessionsData.isResolved ? this.sessionTypeSessionsData.value : [];
  }

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getDataObjects(this.sessionsAndSessionTypeSessions));
  }

  get data() {
    return this.outputData.isResolved ? this.outputData.value : [];
  }

  get sessionsAndSessionTypeSessions() {
    const rhett = {
      sessions: [],
      sessionTypeSessions: [],
    };
    if (this.sessions && this.sessionTypeSessions) {
      rhett.sessions = this.sessions.slice();
      rhett.sessionTypeSessions = this.sessionTypeSessions.slice();
    }
    return rhett;
  }

  async getDataObjects(sessionsAndSessionTypeSessions) {
    const sessions = sessionsAndSessionTypeSessions.sessions;
    const sessionTypeSessions = sessionsAndSessionTypeSessions.sessionTypeSessions;
    const courseSessionsWithSessionType = sessions.filter((session) =>
      sessionTypeSessions.includes(session),
    );

    const sessionsWithMinutes = map(courseSessionsWithSessionType, async (session) => {
      const hours = await session.getTotalSumDuration();
      return {
        session,
        minutes: Math.round(hours * 60),
      };
    });

    const termData = await map(sessionsWithMinutes, async ({ session, minutes }) => {
      const terms = (await session.terms).slice();
      return map(terms, async (term) => {
        const vocabulary = await term.vocabulary;
        return {
          session,
          term,
          vocabulary,
          minutes,
        };
      });
    });

    const data = termData
      .reduce((flattened, arr) => {
        return [...flattened, ...arr];
      }, [])
      .reduce((set, obj) => {
        const label = obj.vocabulary.title + ' - ' + obj.term.title;
        const id = obj.term.id;
        let existing = findById(set, id);
        if (!existing) {
          existing = {
            id,
            data: 0,
            label,
            meta: {
              vocabulary: obj.vocabulary,
              term: obj.term,
              sessions: [],
            },
          };
          set.push(existing);
        }
        existing.data += obj.minutes;
        existing.meta.sessions.push(obj.session);
        return set;
      }, []);

    return data
      .map((obj) => {
        delete obj.id;
        return obj;
      })
      .filter((obj) => {
        return obj.data > 0;
      })
      .sort((first, second) => {
        return (
          first.meta.vocabulary.title.localeCompare(second.meta.vocabulary.title) ||
          first.data - second.data
        );
      });
  }

  get isLoaded() {
    return this.outputData.isResolved;
  }

  barHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }

    const { data, meta } = obj;

    const title = htmlSafe(
      `${meta.vocabulary.title} - ${meta.term.title} &bull; ${data} ${this.intl.t('general.minutes')}`,
    );
    const content = mapBy(meta.sessions, 'title').sort().join(', ');

    this.tooltipTitle = title;
    this.tooltipContent = content;
  });
}
