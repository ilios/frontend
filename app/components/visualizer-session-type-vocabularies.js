import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { map } from 'rsvp';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class VisualizerSessionTypeVocabulariesComponent extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @use sessions = new ResolveAsyncValue(() => [this.args.sessionType.sessions, null]);
  @use loadedData = new AsyncProcess(() => [this.loadData.bind(this), this.sessions]);

  get isLoaded() {
    return !!this.loadedData;
  }

  get data() {
    if (!this.isLoaded) {
      return [];
    }
    return this.loadedData;
  }

  async loadData(sessions) {
    if (!sessions) {
      return null;
    }

    const sessionType = await sessions[0].sessionType;

    const terms = await map(sessions, async (session) => {
      return (await session.terms).slice();
    });

    const termsWithVocabularies = await map(terms.flat(), async (term) => {
      const vocabulary = await term.vocabulary;
      return { term, vocabulary };
    });

    const vocabularyObjects = termsWithVocabularies.reduce((vocabularies, { term, vocabulary }) => {
      const id = vocabulary.id;
      if (!(id in vocabularies)) {
        vocabularies[id] = {
          vocabulary,
          termIds: new Set(),
        };
      }
      vocabularies[id].termIds.add(term.id);
      return vocabularies;
    }, {});

    const vocabularyData = Object.values(vocabularyObjects);

    return vocabularyData
      .map((obj) => {
        return {
          label: obj.vocabulary.title,
          data: obj.termIds.size,
          meta: {
            vocabulary: obj.vocabulary,
            sessionType,
          },
        };
      })
      .filter((obj) => obj.data !== 0);
  }

  @restartableTask
  *donutHover(obj) {
    yield timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }

    const { meta } = obj;

    this.tooltipTitle = htmlSafe(meta.vocabulary.title);
    this.tooltipContent = this.intl.t('general.xTermsFromVocabYusedWithSessionTypeZ', {
      termsCount: obj.data,
      vocabulary: meta.vocabulary.title,
      sessionType: meta.sessionType.title,
    });
  }

  @action
  donutClick(obj) {
    if (this.args.isIcon || !obj || obj.empty || !obj.meta) {
      return;
    }

    this.router.transitionTo(
      'session-type-visualize-terms',
      this.args.sessionType.id,
      obj.meta.vocabulary.id
    );
  }
}
