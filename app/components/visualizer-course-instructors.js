import Component from '@ember/component';
import { all, map } from 'rsvp';
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
  classNameBindings: ['isIcon::not-icon', ':visualizer-course-instructors'],
  tooltipContent: null,
  tooltipTitle: null,
  data: computed('course.sessions.@each.{offerings,instructors,instructorGroups,ilmSessions}', async function () {
    const course = this.get('course');
    const sessions = await course.get('sessions');
    const dataMap = await map(sessions.toArray(), async session => {
      const instructors = await this.getInstructorsForSession(session);

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
        let existing = set.findBy('label', name);
        if (!existing) {
          existing = {
            data: 0,
            label: name,
            meta: {
              instructor,
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
  sortedData: computed('data.[]', async function () {
    const data = await this.get('data');
    data.sort((first, second) => {
      return first.data - second.data;
    });

    return data;
  }),
  flatten(arr) {
    return arr.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);
  },
  async getInstructorsForSession(session) {
    const offerings = await session.get('offerings');
    const offeringInstructors = await all(offerings.mapBy('instructors'));
    const offeringInstructorGroupsArr = await all(offerings.mapBy('instructorGroups'));
    const offeringInstructorGroups = this.flatten(offeringInstructorGroupsArr);


    let ilmInstructorGroups = [];
    let ilmInstructors = [];
    const ilmSession = await session.get('ilmSession');
    if (ilmSession) {
      ilmInstructors = await ilmSession.get('instructors');
      ilmInstructorGroups = await ilmSession.get('instructorGroups');
    }

    const groupInstructors = await all([].concat(offeringInstructorGroups.toArray(), ilmInstructorGroups.toArray()).mapBy('users'));

    const flat = this.flatten([].concat(offeringInstructors, ilmInstructors, groupInstructors));

    return flat.uniq();
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
