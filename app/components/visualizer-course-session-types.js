import Component from '@ember/component';
import { map } from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';

export default Component.extend({
  course: null,
  isIcon: false,
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

    const data = dataMap.reduce((set, obj) => {
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

    return data;
  }),
  donutHover: task(function* (obj) {
    yield timeout(100);
    const isIcon = this.get('isIcon');
    if (isIcon || isEmpty(obj) || obj.empty) {
      return;
    }
    const { meta } = obj;

    const title = htmlSafe(meta.sessionType);
    const sessions = meta.sessions.uniq().sort().join();

    this.set('tooltipTitle', title);
    this.set('tooltipContent', sessions);
  })
});
