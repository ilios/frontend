import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class SchoolVisualizerSessionTypeVocabularyComponent extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @cached
  get sessionsData() {
    return new TrackedAsyncData(this.args.sessionType.sessions);
  }

  get sessions() {
    return this.sessionsData.isResolved ? this.sessionsData.value : null;
  }

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

  @restartableTask
  *donutHover(obj) {
    yield timeout(100);
    if (this.args.isIcon || !obj || obj.empty) {
      this.tooltipTitle = null;
      this.tooltipContent = null;
      return;
    }

    this.tooltipTitle = htmlSafe(obj.label);
    this.tooltipContent = obj.description;
  }
}
