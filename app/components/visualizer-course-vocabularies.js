import Component from '@ember/component';
import { all, map } from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  router: service(),
  i18n: service(),
  course: null,
  isIcon: false,
  classNameBindings: ['isIcon::not-icon', ':visualizer-course-vocabularies'],
  tooltipContent: null,
  tooltipTitle: null,
  data: computed('course.sessions.[]', async function () {
    const course = this.get('course');
    const sessions = await course.get('sessions');
    const dataMap = await map(sessions.toArray(), async session => {
      const terms = await session.get('terms');
      const vocabularies = await all(terms.mapBy('vocabulary'));
      const hours = await session.get('totalSumDuration');
      const minutes = Math.round(hours * 60);

      return {
        sessionTitle: session.get('title'),
        vocabularies,
        minutes,
      };
    });

    const data = dataMap.reduce((set, obj) => {
      obj.vocabularies.forEach(vocabulary => {
        const vocabularyTitle = vocabulary.get('title');
        let existing = set.findBy('label', vocabularyTitle);
        if (!existing) {
          existing = {
            data: 0,
            label: vocabularyTitle,
            meta: {
              vocabulary,
              sessions: []
            }
          };
          set.pushObject(existing);
        }
        existing.data += obj.minutes;
        existing.meta.sessions.pushObject(obj.sessionTitle);
      });

      return set;
    }, []);

    return data;
  }),
  actions: {
    donutClick(obj) {
      const course = this.get('course');
      const isIcon = this.get('isIcon');
      const router = this.get('router');
      if (isIcon || isEmpty(obj) || obj.empty || isEmpty(obj.meta)) {
        return;
      }

      router.transitionTo('course-visualize-vocabulary', course.get('id'), obj.meta.vocabulary.get('id'));
    }
  },
  donutHover: task(function* (obj) {
    yield timeout(100);
    const i18n = this.get('i18n');
    const isIcon = this.get('isIcon');
    if (isIcon || isEmpty(obj) || obj.empty) {
      return;
    }
    const { meta } = obj;

    const title = htmlSafe(meta.vocabulary.get('title'));
    this.set('tooltipTitle', title);
    this.set('tooltipContent', i18n.t('general.clickForMore'));
  }),
});
