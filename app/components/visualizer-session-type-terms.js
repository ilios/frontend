import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { use } from 'ember-could-get-used-to-this';
import AsyncProcess from 'ilios-common/classes/async-process';

export default class VisualizerSessionTypeTermsComponent extends Component {
  @service router;
  @service intl;
  @tracked tooltipContent = null;
  @tracked tooltipTitle = null;

  @use loadedData = new AsyncProcess(() => [
    this.loadData.bind(this),
    this.args.sessionType,
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

  async loadData(sessionType, vocabulary) {
    const sessions = (await sessionType.sessions).slice();
    const terms = await map(sessions, async (session) => {
      const sessionTerms = (await session.terms).slice();
      const course = await session.course;
      const courseTerms = (await course.terms).slice();

      const sessionTermsInThisVocabulary = await filter(sessionTerms, async (term) => {
        const termVocab = await term.vocabulary;
        return termVocab.id === vocabulary.id;
      });
      const courseTermsInThisVocabulary = await filter(courseTerms.slice(), async (term) => {
        const termVocab = await term.vocabulary;
        return termVocab.id === vocabulary.id;
      });
      const sessionTermsObjects = sessionTermsInThisVocabulary.map((term) => {
        return {
          term,
          session,
          course: null,
        };
      });
      const courseTermsObjects = courseTermsInThisVocabulary.map((term) => {
        return {
          term,
          course,
          session: null,
        };
      });

      return [...sessionTermsObjects, ...courseTermsObjects];
    });

    const termObjects = terms.flat().reduce((termObjects, { term, session, course }) => {
      const id = term.id;
      if (!(id in termObjects)) {
        termObjects[id] = {
          data: 0,
          meta: {
            term: term.title,
            courses: {},
            sessions: {},
          },
        };
      }
      if (course) {
        termObjects[id].meta.courses[course.id] = {
          id: course.id,
          title: course.title,
        };
      }
      if (session) {
        termObjects[id].meta.sessions[session.id] = {
          id: session.id,
          title: session.title,
        };
      }
      return termObjects;
    }, {});

    const termData = Object.values(termObjects);

    return termData
      .map((obj) => {
        obj.meta.courses = Object.values(obj.meta.courses);
        obj.meta.sessions = Object.values(obj.meta.sessions);
        obj.data = obj.meta.courses.length + obj.meta.sessions.length;
        obj.label = `${obj.meta.term} (${obj.data})`;
        return obj;
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

    const title = htmlSafe(obj.label);
    const sessions = obj.meta.sessions.map((obj) => obj.title);
    const courses = obj.meta.courses.map((obj) => obj.title);

    this.tooltipTitle = title;
    this.tooltipContent = {
      courses: courses.sort().join(),
      coursesCount: courses.length,
      sessions: sessions.sort().join(),
      sessionsCount: sessions.length,
    };
  }
}
