/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { map } from 'rsvp';
import { computed } from '@ember/object';
import { isPresent, isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),
  sessionType: null,
  isIcon: false,
  classNameBindings: ['isIcon::not-icon', ':visualizer-session-type-vocabularies'],
  tagName: 'span',
  tooltipContent: null,
  tooltipTitle: null,
  data: computed('sessionType.sessions.[]', async function(){
    const sessionType = this.get('sessionType');
    const sessions = await sessionType.get('sessions');
    const terms = await map(sessions.toArray(), async session => {
      const sessionTerms = await session.get('terms');
      const course = await session.get('course');
      const courseTerms = await course.get('terms');

      return [].concat(sessionTerms.toArray()).concat(courseTerms.toArray());
    });

    let flat = terms.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);
    await terms.mapBy('vocabulary');

    let vocabularyObjects = {};
    for (let i = 0; i < flat.length; i++) {
      const term = flat[i];
      const vocabulary = await term.get('vocabulary');
      const id = vocabulary.get('id');
      if (typeof vocabularyObjects[id] !== "undefined") {
        vocabularyObjects[id].data++;
      } else {
        vocabularyObjects[id] = {
          data: 1,
          meta: {
            vocabulary
          }
        };
      }
    }
    const vocabularyData = [];
    Object.keys(vocabularyObjects).forEach(key => {
      vocabularyData.push(vocabularyObjects[key]);
    });
    const totalTerms = vocabularyData.mapBy('data').reduce((total, count) => total + count, 0);
    const data = vocabularyData.map(obj => {
      const percent = (obj.data / totalTerms * 100).toFixed(1);
      obj.label = `${percent}%`;

      return obj;
    });

    return data;
  }),

  vocabulariesWithLinkedTerms: computed('data.[]', async function(){
    const data = await this.get('data');

    return data.filter(obj => obj.data !== 0);
  }),

  async getTooltipData(obj){
    const isIcon = this.get('isIcon');
    if (isIcon || isEmpty(obj) || obj.empty) {
      return '';
    }
    const { meta } = obj;

    let vocabularyTitle = meta.vocabulary.get('title');
    const title = htmlSafe(vocabularyTitle);

    return {
      title,
      content: title
    };
  },
  donutHover: task(function* (obj) {
    yield timeout(100);
    const data = yield this.getTooltipData(obj);
    if (isPresent(data)) {
      this.set('tooltipTitle', data.title);
      this.set('tooltipContent', data.content);
    }
  }).restartable(),
  actions: {
    donutClick(obj) {
      const sessionType = this.get('sessionType');
      const isIcon = this.get('isIcon');
      const router = this.get('router');
      if (isIcon || isEmpty(obj) || obj.empty || isEmpty(obj.meta)) {
        return;
      }

      router.transitionTo('session-type-visualize-terms', sessionType.get('id'), obj.meta.vocabulary.get('id'));
    }
  }
});
