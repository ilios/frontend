/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { map } from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  i18n: service(),
  course: null,
  sessionType: null,
  isIcon: false,
  classNameBindings: ['isIcon::not-icon', ':visualizer-course-session-type'],
  tooltipContent: null,
  tooltipTitle: null,
  data: computed('course.sessions.[]', 'sessionType', async function(){
    const course = this.get('course');
    const sessionType = this.get('sessionType');
    const courseSessions = await course.get('sessions');
    const sessionTypeSessionIds = sessionType.hasMany('sessions').ids();

    const sessions = courseSessions.filter(session => sessionTypeSessionIds.includes(session.get('id')));
    const termData = await map(sessions, async session => {
      const hours = await session.get('totalSumDuration');
      const minutes = Math.round(hours * 60);
      const terms = await session.get('terms');
      return map(terms.toArray(), async term => {
        const vocabulary = await term.get('vocabulary');
        return {
          sessionTitle: session.get('title'),
          termTitle: term.get('title'),
          vocabularyTitle: vocabulary.get('title'),
          minutes
        };
      });
    });

    const flat = termData.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);

    const data = flat.reduce((set, obj) => {
      const label = obj.vocabularyTitle + ' - ' + obj.termTitle;
      let existing = set.findBy('label', label);
      if (!existing) {
        existing = {
          data: 0,
          label,
          meta: {
            sessions: []
          }
        };
        set.pushObject(existing);
      }
      existing.data += obj.minutes;
      existing.meta.sessions.pushObject(obj.sessionTitle);

      return set;
    }, []);

    const totalMinutes = data.mapBy('data').reduce((total, minutes) => total + minutes, 0);
    const mappedTermsWithLabel = data.map(obj => {
      const percent = (obj.data / totalMinutes * 100).toFixed(1);
      obj.label = `${obj.label} ${percent}%`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
    });

    return mappedTermsWithLabel;
  }),
  barHover: task(function* (obj) {
    yield timeout(100);
    const isIcon = this.get('isIcon');
    if (isIcon || isEmpty(obj) || obj.empty) {
      this.set('tooltipTitle', null);
      this.set('tooltipContent', null);
      return;
    }
    const i18n = this.get('i18n');
    const { label, data, meta } = obj;

    const title = htmlSafe(`${label} ${data} ${i18n.t('general.minutes')}`);
    const sessions = meta.sessions.uniq().sort().join(', ');


    this.set('tooltipTitle', title);
    this.set('tooltipContent', sessions);
  }).restartable()
});
