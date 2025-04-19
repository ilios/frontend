import Component from '@glimmer/component';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { dropTask, restartableTask, timeout } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import PapaParse from 'papaparse';
import createDownloadFile from 'ilios-common/utils/create-download-file';
import { action } from '@ember/object';

export default class SchoolVisualizeSessionTypeVocabularyGraphComponent extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;
  @tracked sortBy = 'termTitle';

  @cached
  get outputData() {
    return new TrackedAsyncData(this.getData(this.args.sessionType, this.args.vocabulary));
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
    return this.data.map((obj) => {
      const rhett = {};
      rhett.termTitle = obj.label;
      rhett.sessionsCount = obj.data;
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

  async getData(sessionType, vocabulary) {
    const sessions = await sessionType.sessions;
    if (!sessions.length) {
      return [];
    }

    const termsWithSession = await map(sessions, async (session) => {
      const sessionTerms = await session.terms;

      const terms = await filter(sessionTerms, async (term) => {
        const termVocab = await term.vocabulary;
        return termVocab.id === vocabulary.id;
      });

      return terms.map((term) => {
        return {
          term,
          session,
        };
      });
    });

    const termObjects = termsWithSession
      .filter((termsWithSession) => termsWithSession.length)
      .flat()
      .reduce((obj, termWithSession) => {
        const id = termWithSession.term.id;
        if (!(id in obj)) {
          obj[id] = {
            term: termWithSession.term,
            sessionIds: new Set(),
          };
        }
        obj[id].sessionIds.add(termWithSession.session.id);
        return obj;
      }, {});

    const termData = Object.values(termObjects);

    return termData
      .map((obj) => {
        return {
          data: obj.sessionIds.size,
          label: obj.term.title,
          description: this.intl.t('general.termXappliedToYSessionsWithSessionTypeZ', {
            term: obj.term.title,
            vocabulary: vocabulary.title,
            sessionsCount: obj.sessionIds.size,
            sessionType: sessionType.title,
          }),
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

  downloadData = dropTask(async () => {
    const data = await this.getData(this.args.sessionType, this.args.vocabulary);
    const output = data.map((obj) => {
      const rhett = {};
      rhett[this.intl.t('general.sessionType')] = this.args.sessionType.title;
      rhett[this.intl.t('general.vocabulary')] = this.args.vocabulary.title;
      rhett[this.intl.t('general.term')] = obj.label;
      rhett[this.intl.t('general.sessions')] = obj.data;
      return rhett;
    });
    const csv = PapaParse.unparse(output);
    createDownloadFile(
      `ilios-school-${this.args.sessionType.id}-${this.args.vocabulary.id}-session-type-vocabulary.csv`,
      csv,
      'text/csv',
    );
  });
}
