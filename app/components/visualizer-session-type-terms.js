/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { filter, map } from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  sessionType: null,
  vocabulary: null,
  isIcon: false,
  classNameBindings: ['isIcon::not-icon', ':visualizer-session-type-terms'],
  tagName: 'span',
  tooltipContent: null,
  tooltipTitle: null,
  data: computed('sessionType.sessions.[]', 'vocabulary', async function(){
    const sessionType = this.get('sessionType');
    const vocabulary = this.get('vocabulary');
    const sessions = await sessionType.get('sessions');
    const terms = await map(sessions.toArray(), async session => {
      const sessionTerms = await session.get('terms');
      const course = await session.get('course');
      const courseTerms = await course.get('terms');

      const sessionTermsInThisVocabulary = await filter(sessionTerms.toArray(), async term => {
        const termVocab = await term.get('vocabulary');
        return termVocab.get('id') === vocabulary.get('id');
      });
      const courseTermsInThisVocabulary = await filter(courseTerms.toArray(), async term => {
        const termVocab = await term.get('vocabulary');
        return termVocab.get('id') === vocabulary.get('id');
      });
      const sessionTermsObjects = await sessionTermsInThisVocabulary.map(term => {
        return {
          term,
          session,
          course: null
        };
      });
      const courseTermsObjects = await courseTermsInThisVocabulary.map(term => {
        return {
          term,
          course,
          session: null
        };
      });

      return [].concat(sessionTermsObjects.toArray()).concat(courseTermsObjects.toArray());
    });

    let flat = terms.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);

    let termObjects = {};
    for (let i = 0; i < flat.length; i++) {
      const { term, session, course } = flat[i];
      const id = term.get('id');
      if (typeof termObjects[id] !== "undefined") {
        termObjects[id].data++;
      } else {
        termObjects[id] = {
          data: 1,
          meta: {
            term: term.get('title'),
            courses: [],
            sessions: []
          }
        };
      }
      if (session) {
        termObjects[id].meta.sessions.pushObject(session.get('title'));
      }
      if (course) {
        termObjects[id].meta.courses.pushObject(course.get('title'));
      }
    }
    const termData = [];
    Object.keys(termObjects).forEach(key => {
      termData.push(termObjects[key]);
    });
    const totalLinks = termData.mapBy('data').reduce((total, count) => total + count, 0);
    const data = termData.map(obj => {
      const percent = (obj.data / totalLinks * 100).toFixed(1);
      obj.label = `${percent}%`;

      return obj;
    });

    return data;
  }),
  donutHover: task(function* (obj) {
    yield timeout(100);
    const isIcon = this.get('isIcon');
    if (isIcon || isEmpty(obj) || obj.empty) {
      return;
    }
    const { meta } = obj;

    const title = htmlSafe(meta.term);
    const sessions = meta.sessions.uniq().sort().join();
    const courses = meta.courses.uniq().sort().join();

    this.set('tooltipTitle', title);
    this.set('tooltipContent', { sessions, courses });
  })
});
