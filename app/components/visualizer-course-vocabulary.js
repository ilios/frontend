/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { filter, map } from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  course: null,
  vocabulary: null,
  isIcon: false,
  classNameBindings: ['isIcon::not-icon', ':visualizer-course-vocabulary'],
  tooltipContent: null,
  tooltipTitle: null,
  data: computed('course.sessions.[]', 'vocabulary', async function(){
    const course = this.get('course');
    const vocabulary = this.get('vocabulary');
    const sessions = await course.get('sessions');
    const terms = await map(sessions.toArray(), async session => {
      const sessionTerms = await session.get('terms');

      const sessionTermsInThisVocabulary = await filter(sessionTerms.toArray(), async term => {
        const termVocab = await term.get('vocabulary');
        return termVocab.get('id') === vocabulary.get('id');
      });
      return sessionTermsInThisVocabulary.map(term => {
        return {
          term,
          session
        };
      });
    });

    let flat = terms.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);

    let termObjects = {};
    for (let i = 0; i < flat.length; i++) {
      const { term, session } = flat[i];

      const id = term.get('id');
      if (typeof termObjects[id] === "undefined") {
        termObjects[id] = {
          data: 0,
          label: term.get('title'),
          meta: {
            term: term.get('title'),
            sessions: []
          }
        };
      }
      const hours = await session.get('maxSingleOfferingDuration');
      const minutes = Math.round(hours * 60);
      termObjects[id].data += minutes;
      termObjects[id].meta.sessions.pushObject(session.get('title'));
    }
    const termData = [];
    Object.keys(termObjects).forEach(key => {
      termData.push(termObjects[key]);
    });

    return termData;
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

    this.set('tooltipTitle', title);
    this.set('tooltipContent', sessions);
  })
});
