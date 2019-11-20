import Component from '@ember/component';
import { filter, map } from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  intl: service(),
  router: service(),
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
      const hours = await session.get('totalSumDuration');
      const minutes = Math.round(hours * 60);
      const sessionTermsInThisVocabulary = await filter(sessionTerms.toArray(), async term => {
        const termVocab = await term.get('vocabulary');
        return termVocab.get('id') === vocabulary.get('id');
      });
      return sessionTermsInThisVocabulary.map(term => {
        return {
          term,
          session: {
            title: session.get('title'),
            minutes,
          }
        };
      });
    });

    let flat = terms.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);

    const termData = flat.reduce((set, { term, session }) => {
      const termTitle = term.get('title');
      let existing = set.findBy('label', termTitle);
      if (!existing) {
        existing = {
          data: 0,
          label: termTitle,
          meta: {
            termTitle,
            termId: term.get('id'),
            sessions: []
          }
        };
        set.pushObject(existing);
      }
      existing.data += session.minutes;
      existing.meta.sessions.pushObject(session.title);

      return set;
    }, []);

    const totalMinutes = termData.mapBy('data').reduce((total, minutes) => total + minutes, 0);
    const mappedTermsWithLabel = termData.map(obj => {
      const percent = (obj.data / totalMinutes * 100).toFixed(1);
      obj.label = `${obj.meta.termTitle} ${percent}%`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
    });

    return mappedTermsWithLabel;
  }),
  sortedData: computed('data.[]', async function () {
    const data = await this.get('data');
    data.sort((first, second) => {
      return first.data - second.data;
    });

    return data;
  }),
  actions: {
    barClick(obj) {
      const course = this.get('course');
      const isIcon = this.get('isIcon');
      const router = this.get('router');
      if (isIcon || isEmpty(obj) || obj.empty || isEmpty(obj.meta)) {
        return;
      }

      router.transitionTo('course-visualize-term', course.get('id'), obj.meta.termId);
    }
  },
  barHover: task(function* (obj) {
    yield timeout(100);
    const isIcon = this.get('isIcon');
    if (isIcon || isEmpty(obj) || obj.empty) {
      this.set('tooltipTitle', null);
      this.set('tooltipContent', null);
      return;
    }
    const intl = this.get('intl');
    const { label, data, meta } = obj;

    const title = htmlSafe(`${label} ${data} ${intl.t('general.minutes')}`);
    const sessions = meta.sessions.uniq().sort().join();

    this.set('tooltipTitle', title);
    this.set('tooltipContent', sessions);
  }).restartable()
});
