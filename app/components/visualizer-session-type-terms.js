import Component from '@glimmer/component';
import { htmlSafe } from '@ember/template';
import { filter, map } from 'rsvp';
import { restartableTask, timeout } from 'ember-concurrency';
import { tracked } from '@glimmer/tracking';
import { mapBy, uniqueValues } from 'ilios-common/utils/array-helpers';

export default class VisualizerSessionTypeTermsComponent extends Component {
  @tracked tooltipContent;
  @tracked tooltipTitle;
  @tracked data = [];

  @restartableTask
  *load(element, [sessionType, vocabulary]) {
    const sessions = (yield sessionType.sessions).slice();
    const terms = yield map(sessions, async (session) => {
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
            courses: [],
            sessions: [],
          },
        };
      }
      termObjects[id].data++;
      termObjects[id].meta.courses.push(course?.title);
      termObjects[id].meta.sessions.push(session?.title);

      return termObjects;
    }, {});

    const termData = Object.values(termObjects);

    const totalLinks = mapBy(termData, 'data').reduce((total, count) => total + count, 0);
    this.data = termData.map((obj) => {
      const percent = ((obj.data / totalLinks) * 100).toFixed(1);
      obj.label = `${percent}%`;

      return obj;
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
    const { meta } = obj;

    const title = htmlSafe(meta.term);
    const sessions = uniqueValues(meta.sessions).sort().join();
    const courses = uniqueValues(meta.courses).sort().join();

    this.tooltipTitle = title;
    this.tooltipContent = { sessions, courses };
  }
}
