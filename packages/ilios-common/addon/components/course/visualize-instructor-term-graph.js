import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';
import { action } from '@ember/object';

export default class CourseVisualizeInstructorTermGraph extends Component {
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
    return this.sessionsData.isResolved ? this.sessionsData.value.slice() : [];
  }

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.sessions));
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

  async getData(sessions) {
    if (!sessions.length) {
      return [];
    }

    const sessionsWithUser = await filter(sessions, async (session) => {
      const allInstructors = await session.getAllOfferingInstructors();
      return mapBy(allInstructors, 'id').includes(this.args.user.id);
    });

    const sessionsWithTerms = await map(sessionsWithUser, async (session) => {
      const terms = await map((await session.terms).slice(), async (term) => {
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
        delete obj.id;
        return obj;
      })
      .filter((obj) => {
        return obj.data > 0;
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
}
