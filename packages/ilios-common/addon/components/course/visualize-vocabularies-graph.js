import Component from '@glimmer/component';
import { all, map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import { findById, mapBy, uniqueById } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeVocabulariesGraph extends Component {
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

  get tableData() {
    return this.data.map((obj) => {
      const rhett = {};
      rhett.minutes = obj.data;
      rhett.sessions = obj.meta.sessions;
      rhett.vocabulary = obj.meta.vocabulary.title;
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

    const sessionWithMinutesAndVocabs = await map(
      sessionsWithMinutes,
      async ({ session, minutes }) => {
        const terms = (await session.terms).slice();
        const vocabularies = await all(mapBy(terms, 'vocabulary'));
        return {
          session,
          vocabularies: uniqueById(vocabularies),
          minutes,
        };
      },
    );

    return sessionWithMinutesAndVocabs
      .reduce((set, obj) => {
        obj.vocabularies.forEach((vocabulary) => {
          const id = vocabulary.id;
          let existing = findById(set, id);
          if (!existing) {
            existing = {
              id,
              data: 0,
              label: vocabulary.title,
              meta: {
                vocabulary,
                sessions: [],
              },
            };
            set.push(existing);
          }
          existing.data += obj.minutes;
          existing.meta.sessions.push(obj.session);
        });

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

    const title = htmlSafe(
      `${meta.vocabulary.title} &bull; ${data} ${this.intl.t('general.minutes')}`,
    );
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
    this.router.transitionTo(
      'course-visualize-vocabulary',
      this.args.course.id,
      obj.meta.vocabulary.id,
    );
  }
}
