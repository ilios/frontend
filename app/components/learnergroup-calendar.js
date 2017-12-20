import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import moment from 'moment';
const { map } = RSVP;

export default Component.extend({
  classNames: ['learnergroup-calendar'],

  learnerGroup: null,
  selectedDate: null,

  calendarEvents: computed('learnerGroup.offerings.[]', async function () {
    const learnerGroup = this.get('learnerGroup');
    if (!learnerGroup) {
      return [];
    }
    const offerings = await learnerGroup.get('offerings');
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
      const selectedDate = this.get('selectedDate');
      let newDate = moment(selectedDate).add(1, 'week').toDate();
      this.set('selectedDate', newDate);
    },
    goBack(){
      const selectedDate = this.get('selectedDate');
      let newDate = moment(selectedDate).subtract(1, 'week').toDate();
      this.set('selectedDate', newDate);
    },
    gotoToday(){
      let newDate = moment().toDate();
      this.set('selectedDate', newDate);
    },
  }
});
