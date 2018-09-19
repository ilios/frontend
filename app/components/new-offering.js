/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';

export default Component.extend({
  store: service(),
  classNames: ['new-offering'],
  session: null,
  courseStartDate: null,
  courseEndDate: null,
  smallGroupMode: true,
  actions: {
    save(startDate, endDate, room, learnerGroups, instructorGroups, instructors){
      const store = this.store;
      const session = this.session;
      let offering = store.createRecord('offering');
      offering.setProperties({startDate, endDate, room, learnerGroups, instructorGroups, instructors, session});

      return offering.save();
    }
  }
});
