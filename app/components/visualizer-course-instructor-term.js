/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { filter, map } from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';

export default Component.extend({
  i18n: service(),
  router: service(),
  course: null,
  user: null,
  isIcon: false,
  classNameBindings: ['isIcon::not-icon', ':visualizer-course-instructor-session-type'],
  tooltipContent: null,
  tooltipTitle: null,
  data: computed('course.sessions.[]', 'vocabulary', async function(){
    const course = this.course;
    const user = this.user;
    const sessions = await course.get('sessions');
    const sessionsWithUser = await filter(sessions.toArray(), async session => {
      const instructors = await session.get('allInstructors');
      return instructors.mapBy('id').includes(user.get('id'));
    });

    const dataMap = await map(sessionsWithUser, async session => {
      const terms = await session.get('terms');

      const hours = await session.get('totalSumDuration');
      const minutes = Math.round(hours * 60);

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

    const flat = dataMap.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);

    const sessionTypeData = flat.reduce((set, obj) => {
      const name = `${obj.vocabularyTitle} > ${obj.termTitle}`;
      let existing = set.findBy('label', name);
      if (!existing) {
        existing = {
          data: 0,
          label: name,
          meta: {
            sessions: [],
            vocabularyTitle: obj.vocabularyTitle
          }
        };
        set.pushObject(existing);
      }
      existing.data += obj.minutes;
      existing.meta.sessions.pushObject(obj.sessionTitle);

      return set;
    }, []);

    const totalMinutes = sessionTypeData.mapBy('data').reduce((total, minutes) => total + minutes, 0);
    const mappedWithLabel = sessionTypeData.map(obj => {
      const percent = (obj.data / totalMinutes * 100).toFixed(1);
      obj.label = `${obj.label} ${percent}%`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
    });

    return mappedWithLabel;

  }),
  sortedData: computed('data.[]', async function () {
    const data = await this.data;
    data.sort((first, second) => {
      return first.meta.vocabularyTitle.localeCompare(second.meta.vocabularyTitle) || second.data - first.data;
    });

    return data;
  }),
  donutHover: task(function* (obj) {
    yield timeout(100);
    const isIcon = this.isIcon;
    if (isIcon || isEmpty(obj) || obj.empty) {
      this.set('tooltipTitle', null);
      this.set('tooltipContent', null);
      return;
    }
    const i18n = this.i18n;
    const { label, data, meta } = obj;

    const title = htmlSafe(`${label} ${data} ${i18n.t('general.minutes')}`);
    const sessions = meta.sessions.uniq().sort().join();

    this.set('tooltipTitle', title);
    this.set('tooltipContent', sessions);
  }).restartable()
});
