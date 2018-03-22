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
  isIcon: false,
  chartType: 'horz-bar',
  classNameBindings: ['isIcon::not-icon', ':visualizer-course-session-types'],
  tooltipContent: null,
  tooltipTitle: null,
  data: computed('course.sessions.[]', async function () {
    const course = this.get('course');
    const sessions = await course.get('sessions');
    const dataMap = await map(sessions.toArray(), async session => {
      const sessionType = await session.get('sessionType');
      const hours = await session.get('maxSingleOfferingDuration');
      const minutes = Math.round(hours * 60);
      return {
        sessionTitle: session.get('title'),
        sessionTypeTitle: sessionType.get('title'),
        minutes,
      };
    });

    const mappedSessionTypes = dataMap.reduce((set, obj) => {
      let existing = set.findBy('label', obj.sessionTypeTitle);
      if (!existing) {
        existing = {
          data: 0,
          label: obj.sessionTypeTitle,
          meta: {
            sessionType: obj.sessionTypeTitle,
            sessions: []
          }
        };
        set.pushObject(existing);
      }
      existing.data += obj.minutes;
      existing.meta.sessions.pushObject(obj.sessionTitle);

      return set;
    }, []);


    const totalMinutes = mappedSessionTypes.mapBy('data').reduce((total, minutes) => total + minutes, 0);
    const mappedSessionTypesWithLabel = mappedSessionTypes.map(obj => {
      const percent = (obj.data / totalMinutes * 100).toFixed(1);
      obj.label = `${obj.meta.sessionType} ${percent}%`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
    });

    return mappedSessionTypesWithLabel;
  }),
  barHover: task(function* (obj) {
    yield timeout(100);
    const isIcon = this.get('isIcon');
    if (isIcon || isEmpty(obj) || obj.empty) {
      return;
    }
    const i18n = this.get('i18n');
    const { label, data, meta } = obj;

    const title = htmlSafe(`${label} ${data} ${i18n.t('general.minutes')}`);
    const sessions = meta.sessions.uniq().sort().join();

    this.set('tooltipTitle', title);
    this.set('tooltipContent', sessions);
  })
});
