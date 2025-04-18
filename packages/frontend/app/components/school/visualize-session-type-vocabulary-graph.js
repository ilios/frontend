import Component from '@glimmer/component';
import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { restartableTask, timeout } from 'ember-concurrency';
import { cached, tracked } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class SchoolVisualizeSessionTypeVocabularyGraphComponent extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @cached
  get outputData() {
    return new TrackedAsyncData(this.loadData(this.args.sessionType, this.args.vocabulary));
  }

  get data() {
    return this.outputData.isResolved ? this.outputData.value : [];
  }

  get isLoaded() {
    return this.outputData.isResolved;
  }

  async loadData(sessionType, vocabulary) {
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
}
