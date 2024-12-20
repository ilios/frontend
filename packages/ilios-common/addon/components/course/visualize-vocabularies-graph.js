import Component from '@glimmer/component';
import { all, map } from 'rsvp';
import { htmlSafe } from '@ember/template';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import PapaParse from 'papaparse';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import { findById, mapBy, sortBy, uniqueById } from 'ilios-common/utils/array-helpers';

export default class CourseVisualizeVocabulariesGraph extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'minutes';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getDataObjects(this.args.course));
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
      rhett.vocabulary = obj.meta.vocabulary;
      rhett.vocabularyTitle = obj.meta.vocabulary.title;
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

  async getDataObjects(course) {
    const sessions = await course.sessions;
    if (!sessions.length) {
      return [];
    }

    const sessionsWithMinutes = await map(sessions, async (session) => {
      const hours = await session.getTotalSumDuration();
      return {
        session,
        minutes: Math.round(hours * 60),
      };
    });

    const sessionWithMinutesAndVocabs = await map(
      sessionsWithMinutes,
      async ({ session, minutes }) => {
        const terms = await session.terms;
        const vocabularies = await all(mapBy(terms, 'vocabulary'));
        return {
          session,
          vocabularies: uniqueById(vocabularies),
          minutes,
        };
      },
    );

    return sessionWithMinutesAndVocabs
      .reduce((set, { session, vocabularies, minutes }) => {
        vocabularies.forEach((vocabulary) => {
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
          existing.data += minutes;
          existing.meta.sessions.push(session);
        });

        return set;
      }, [])
      .map((obj) => {
        obj.description = `${obj.meta.vocabulary.title} - ${obj.data} ${this.intl.t('general.minutes')}`;
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
    this.tooltipTitle = htmlSafe(
      `${meta.vocabulary.title} &bull; ${data} ${this.intl.t('general.minutes')}`,
    );
    this.tooltipContent = htmlSafe(mapBy(meta.sessions, 'title').sort().join(', '));
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

  downloadData = dropTask(async () => {
    const data = await this.getDataObjects(this.args.course);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[`${this.intl.t('general.vocabulary')}`] = obj.meta.vocabulary.title;
      rhett[this.intl.t('general.sessions')] = mapBy(obj.meta.sessions, 'title').sort().join(', ');
      rhett[this.intl.t('general.minutes')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(`ilios-course-${this.args.course.id}-vocabularies.csv`, csv, 'text/csv');
  });
}
