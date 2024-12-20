import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
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

export default class CourseVisualizeInstructorTermGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'minutes';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.args.course, this.args.user));
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

  get isLoaded() {
    return this.outputData.isResolved;
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

  async getData(course, user) {
    const sessions = await course.sessions;
    if (!sessions.length) {
      return [];
    }
    const sessionsWithUser = await filter(sessions, async (session) => {
      const allInstructors = await session.getAllOfferingInstructors();
      return mapBy(allInstructors, 'id').includes(user.id);
    });

    const sessionsWithTerms = await map(sessionsWithUser, async (session) => {
      const sessionTerms = await session.terms;
      const terms = await map(sessionTerms, async (term) => {
        const vocabulary = await term.vocabulary;
        return {
          term,
          vocabulary,
        };
      });

      return {
        session,
        terms,
      };
    });

    const dataMap = await map(sessionsWithTerms, async ({ session, terms }) => {
      const minutes = await session.getTotalSumDurationByInstructor(this.args.user);
      return terms.map(({ term, vocabulary }) => {
        return {
          session,
          term,
          vocabulary,
          minutes,
        };
      });
    });

    return dataMap
      .reduce((flattened, arr) => {
        return [...flattened, ...arr];
      }, [])
      .reduce((set, { term, session, vocabulary, minutes }) => {
        const label = vocabulary.title + ' - ' + term.title;
        const id = term.id;
        let existing = findById(set, id);
        if (!existing) {
          existing = {
            id,
            data: 0,
            label,
            meta: {
              term,
              vocabulary,
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
        (obj.description = `${obj.meta.vocabulary.title} - ${obj.meta.term.title} - ${obj.data} ${this.intl.t('general.minutes')}`),
          delete obj.id;
        return obj;
      })
      .sort((first, second) => {
        return (
          first.meta.vocabulary.title.localeCompare(second.meta.vocabulary.title) ||
          second.data - first.data
        );
      });
  }

  donutHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || isEmpty(obj) || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }

    const { data, meta } = obj;

    this.tooltipTitle = htmlSafe(
      `${meta.vocabulary.title} - ${meta.term.title} &bull; ${data} ${this.intl.t('general.minutes')}`,
    );
    this.tooltipContent = htmlSafe(mapBy(meta.sessions, 'title').sort().join(', '));
  });

  downloadData = dropTask(async () => {
    const data = await this.getData(this.args.course, this.args.user);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[`${this.intl.t('general.term')}`] = obj.meta.term.title;
      rhett[this.intl.t('general.sessions')] = mapBy(obj.meta.sessions, 'title').sort().join(', ');
      rhett[this.intl.t('general.minutes')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(
      `ilios-course-${this.args.course.id}-instructor-${this.args.user.id}-vocabulary-terms.csv`,
      csv,
      'text/csv',
    );
  });
}
