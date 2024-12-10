import Component from '@glimmer/component';
import { map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { action } from '@ember/object';
import PapaParse from 'papaparse';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import { findById, mapBy, sortBy } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeSessionTypeGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'vocabularyTerm';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getDataObjects(this.args.course, this.args.sessionType));
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

  get isLoaded() {
    return this.outputData.isResolved;
  }

  get tableData() {
    return this.data.map((obj) => {
      const rhett = {};
      rhett.minutes = obj.data;
      rhett.sessions = sortBy(obj.meta.sessions, 'title');
      rhett.vocabularyTerm = `${obj.meta.vocabulary.title} - ${obj.meta.term.title}`;
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

  async getDataObjects(course, sessionType) {
    const sessions = await course.sessions;
    const sessionTypeSessions = await sessionType.sessions;

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
      const terms = await session.terms;
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

    return termData
      .reduce((flattened, arr) => {
        return [...flattened, ...arr];
      }, [])
      .reduce((set, { vocabulary, term, session, minutes }) => {
        const label = vocabulary.title + ' - ' + term.title;
        const id = term.id;
        let existing = findById(set, id);
        if (!existing) {
          existing = {
            id,
            data: 0,
            label,
            meta: {
              vocabulary,
              term,
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
        obj.description = `${obj.meta.vocabulary.title} - ${obj.meta.term.title} - ${obj.data} ${this.intl.t('general.minutes')}`;
        delete obj.id;
        return obj;
      })
      .sort((first, second) => {
        return (
          first.meta.vocabulary.title.localeCompare(second.meta.vocabulary.title) ||
          first.data - second.data
        );
      });
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

  downloadData = dropTask(async () => {
    const data = await this.getDataObjects(this.args.course, this.args.sessionType);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[`${this.intl.t('general.vocabulary')} - ${this.intl.t('general.term')}`] =
        `${obj.meta.vocabulary.title} - ${obj.meta.term.title}`;
      rhett[this.intl.t('general.sessions')] = mapBy(obj.meta.sessions, 'title').sort().join(', ');
      rhett[this.intl.t('general.minutes')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(
      `ilios-course-${this.args.course.id}-session-type-${this.args.sessionType.id}-vocabulary-terms.csv`,
      csv,
      'text/csv',
    );
  });
}
