import Component from '@ember/component';
import { map } from 'rsvp';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { htmlSafe } from '@ember/string';
import { task, timeout } from 'ember-concurrency';
import { inject as service } from '@ember/service';
import layout from '../templates/components/visualizer-course-instructors';

export default Component.extend({
  layout,
  i18n: service(),
  router: service(),
  course: null,
  isIcon: false,
  chartType: 'horz-bar',
  classNameBindings: ['isIcon::not-icon', ':visualizer-course-instructors'],
  tooltipContent: null,
  tooltipTitle: null,
  filter: '',
  data: computed('course.sessions.@each.{offerings,instructors,instructorGroups,ilmSessions}', async function () {
    const course = this.get('course');
    const sessions = await course.get('sessions');
    const dataMap = await map(sessions.toArray(), async session => {
      const instructors = await session.get('allInstructors');

      const hours = await session.get('maxSingleOfferingDuration');
      const minutes = Math.round(hours * 60);

      return {
        sessionTitle: session.get('title'),
        instructors,
        minutes,
      };
    });

    const instructorData = dataMap.reduce((set, obj) => {
      obj.instructors.forEach(instructor => {
        const name = instructor.get('fullName');
        const id = instructor.get('id');
        let existing = set.findBy('label', name);
        if (!existing) {
          existing = {
            data: 0,
            label: name,
            meta: {
              userId: id,
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

    const totalMinutes = instructorData.mapBy('data').reduce((total, minutes) => total + minutes, 0);
    const mappedInstructorsWithLabel = instructorData.map(obj => {
      const percent = (obj.data / totalMinutes * 100).toFixed(1);
      obj.label = `${obj.label} ${percent}%`;
      obj.meta.totalMinutes = totalMinutes;
      obj.meta.percent = percent;
      return obj;
    });

    return mappedInstructorsWithLabel;
  }),
  filteredData: computed('data.[]', 'filter', async function(){
    const data = await this.get('data');
    const filter = this.get('filter');
    if (!filter) {
      return data;
    }

    let exp = new RegExp(filter, 'gi');
    return data.filter(({ label }) => label.match(exp));
  }),
  sortedData: computed('filteredData.[]', async function () {
    const data = await this.get('filteredData');
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

      router.transitionTo('course-visualize-instructor', course.get('id'), obj.meta.userId);
    }
  },
  barHover: task(function* (obj) {
    yield timeout(100);
    const i18n = this.get('i18n');
    const isIcon = this.get('isIcon');
    if (isIcon || isEmpty(obj) || obj.empty) {
      this.set('tooltipTitle', null);
      this.set('tooltipContent', null);
      return;
    }
    const { label, data, meta } = obj;

    const title = htmlSafe(`${label} ${data} ${i18n.t('general.minutes')}`);
    const sessions = meta.sessions.uniq().sort().join();
    this.set('tooltipTitle', title);
    this.set('tooltipContent', htmlSafe(sessions + '<br /><br />' + i18n.t('general.clickForMore')));
  }).restartable(),
});
