import Component from '@glimmer/component';
import { filter, map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { findById, mapBy } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeVocabularyGraph extends Component {
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
    return this.sessionsData.isResolved ? this.sessionsData.value : [];
  }

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getDataObjects(this.sessions));
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
      rhett.term = obj.meta.term.title;
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

  async getDataObjects(sessions) {
    if (!sessions.length) {
      return [];
    }
    const sessionsWithMinutes = await map(sessions.slice(), async (session) => {
      const hours = await session.getTotalSumDuration();
      return {
        session,
        minutes: Math.round(hours * 60),
      };
    });
    const termsWithSessionAndMinutes = await map(
      sessionsWithMinutes,
      async ({ session, minutes }) => {
        const sessionTerms = await session.terms;
        const sessionTermsInThisVocabulary = await filter(sessionTerms.slice(), async (term) => {
          const termVocab = await term.vocabulary;
          return termVocab.id === this.args.vocabulary.id;
        });
        return sessionTermsInThisVocabulary.map((term) => {
          return {
            term,
            session,
            minutes,
          };
        });
      },
    );

    return termsWithSessionAndMinutes
      .reduce((flattened, arr) => {
        return [...flattened, ...arr];
      }, [])
      .reduce((set, { term, session, minutes }) => {
        const id = term.id;
        let existing = findById(set, id);
        if (!existing) {
          existing = {
            id,
            data: 0,
            label: term.title,
            meta: {
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
        delete obj.id;
        return obj;
      })
      .sort((first, second) => {
        return first.data - second.data;
      });
  }

  barHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }
    const { data, meta } = obj;

    const title = htmlSafe(`${meta.term.title} &bull; ${data} ${this.intl.t('general.minutes')}`);
    const sessionTitles = mapBy(meta.sessions, 'title');
    const content = sessionTitles.sort().join(', ');

    this.tooltipTitle = title;
    this.tooltipContent = content;
  });

  @action
  barClick(obj) {
    if (this.args.isIcon || !obj || obj.empty || !obj.meta) {
      return;
    }
    this.router.transitionTo('course-visualize-term', this.args.course.id, obj.meta.term.id);
  }
}
