import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class SchoolVisualizerSessionTypeVocabularyComponent extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @use sessions = new ResolveAsyncValue(() => [this.args.sessionType.sessions, null]);

  @use loadedData = new AsyncProcess(() => [
    this.loadData.bind(this),
    this.sessions,
    this.args.vocabulary,
  ]);

  get isLoaded() {
    return !!this.loadedData;
  }

  get data() {
    if (!this.loadedData) {
      return [];
    }
    return this.loadedData;
  }

  async loadData(sessions, vocabulary) {
    if (!sessions) {
      return null;
    }

    if (!sessions.length) {
      return [];
    }

    const sessionType = await sessions[0].sessionType;

    const termsWithSession = await map(sessions, async (session) => {
      const sessionTerms = (await session.terms).slice();

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
          meta: {
            term: obj.term,
            sessionType,
            vocabulary,
          },
        };
      })
      .sort((first, second) => {
        return first.data - second.data;
      });
  }

  @restartableTask
  *donutHover(obj) {
    yield timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }

    this.tooltipTitle = htmlSafe(obj.label);
    this.tooltipContent = this.intl.t('general.termXappliedToYSessionsWithSessionTypeZ', {
      term: obj.meta.term.title,
      vocabulary: obj.meta.vocabulary.title,
      sessionsCount: obj.data,
      sessionType: obj.meta.sessionType.title,
    });
  }
}
