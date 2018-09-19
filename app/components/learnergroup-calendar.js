import Component from '@ember/component';
import { computed } from '@ember/object';
import { map, all } from 'rsvp';
import moment from 'moment';

export default Component.extend({
  classNames: ['learnergroup-calendar'],

  learnerGroup: null,
  selectedDate: null,
  showSubgroupEvents: false,

  offerings: computed('learnerGroup.offerings.[]', 'learnerGroup.allDescendants.[]', 'showSubgroupEvents', async function () {
    const learnerGroup = this.learnerGroup;
    const showSubgroupEvents = this.showSubgroupEvents;
    if (!learnerGroup) {
      return [];
    }
    let learnerGroups = [learnerGroup];
    if (showSubgroupEvents) {
      const allDescendants = await learnerGroup.get('allDescendants');
      learnerGroups.pushObjects(allDescendants);
    }
    const offerings = await all(learnerGroups.mapBy('offerings'));
    let flat = offerings.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);

    return flat;
  }),

  calendarEvents: computed('offerings.[]', async function () {
    const offerings = await this.offerings;
    const events = await map(offerings.toArray(), async offering => {
      const session = await offering.get('session');
      const course = await session.get('course');
      return {
        startDate: offering.get('startDate'),
        endDate: offering.get('endDate'),
        courseTitle: course.get('title'),
        name: session.get('title'),
        offering: offering.get("id"),
        location: offering.get("location"),
        color: "#84c444"
      };
    });

    return events;
  }),

  init() {
    this._super(...arguments);
    const today = moment();
    this.set('selectedDate', today.toDate());
  },

  actions: {
    goForward(){
      const selectedDate = this.selectedDate;
      let newDate = moment(selectedDate).add(1, 'week').toDate();
      this.set('selectedDate', newDate);
    },
    goBack(){
      const selectedDate = this.selectedDate;
      let newDate = moment(selectedDate).subtract(1, 'week').toDate();
      this.set('selectedDate', newDate);
    },
    gotoToday(){
      let newDate = moment().toDate();
      this.set('selectedDate', newDate);
    },
  }
});
