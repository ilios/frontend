import Component from '@glimmer/component';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { map } from 'rsvp';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';
import PapaParse from 'papaparse';
import createDownloadFile from 'ilios-common/utils/create-download-file';

export default class SchoolVisualizeSessionTypeVocabulariesGraphComponent extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'vocabularyTitle';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.args.sessionType));
  }

  get isLoaded() {
    return this.outputData.isResolved;
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
    return this.chartData.map((obj) => {
      const rhett = {};
      rhett.vocabularyTitle = obj.label;
      rhett.termsCount = obj.data;
      rhett.sessionsCount = obj.meta.sessionsCount;
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

  async getData(sessionType) {
    const sessions = await sessionType.sessions;

    if (!sessions.length) {
      return [];
    }

    const sessionsWithTerms = await map(sessions, async (session) => {
      const terms = await session.terms;
      return terms.map((term) => {
        return { session, term };
      });
    });

    const termsWithSessionAndVocabulary = await map(
      sessionsWithTerms.flat(),
      async ({ session, term }) => {
        const vocabulary = await term.vocabulary;
        return {
          term,
          session,
          vocabulary,
        };
      },
    );

    const vocabularyObjects = termsWithSessionAndVocabulary.reduce(
      (vocabularies, { term, session, vocabulary }) => {
        const id = vocabulary.id;
        if (!(id in vocabularies)) {
          vocabularies[id] = {
            vocabulary,
            termIds: new Set(),
            sessionIds: new Set(),
          };
        }
        vocabularies[id].sessionIds.add(session.id);
        vocabularies[id].termIds.add(term.id);
        return vocabularies;
      },
      {},
    );

    const vocabularyData = Object.values(vocabularyObjects);

    return vocabularyData
      .map((obj) => {
        return {
          label: obj.vocabulary.title,
          data: obj.termIds.size,
          description: this.intl.t('general.xTermsFromVocabYusedWithSessionTypeZ', {
            termsCount: obj.termIds.size,
            vocabulary: obj.vocabulary.title,
            sessionsCount: obj.sessionIds.size,
            sessionType: sessionType.title,
          }),
          meta: {
            vocabulary: obj.vocabulary,
            sessionsCount: obj.sessionIds.size,
          },
        };
      })
      .sort((first, second) => {
        return first.data - second.data;
      });
  }

  donutHover = restartableTask(async (obj) => {
    await timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }

    this.tooltipTitle = htmlSafe(obj.label);
    this.tooltipContent = obj.description;
  });

  @action
  donutClick(obj) {
    if (this.args.isIcon || !obj || obj.empty || !obj.meta) {
      return;
    }

    this.router.transitionTo(
      'session-type-visualize-vocabulary',
      this.args.sessionType.id,
      obj.meta.vocabulary.id,
    );
  }

  downloadData = dropTask(async () => {
    const data = await this.getData(this.args.sessionType);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[this.intl.t('general.sessionType')] = this.args.sessionType.title;
      rhett[this.intl.t('general.vocabulary')] = obj.label;
      rhett[this.intl.t('general.terms')] = obj.data;
      rhett[this.intl.t('general.sessions')] = obj.meta.sessionsCount;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(
      `ilios-school-${this.args.sessionType.id}-session-type-vocabularies.csv`,
      csv,
      'text/csv',
    );
  });
}
