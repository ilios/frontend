/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import layout from '../templates/components/new-offering';

export default Component.extend({
  layout,
  store: service(),
  classNames: ['new-offering'],
  session: null,
  courseStartDate: null,
  courseEndDate: null,
  smallGroupMode: true,
  actions: {
    save(startDate, endDate, room, learnerGroups, instructorGroups, instructors){
      const store = this.get('store');
      const session = this.get('session');
      let offering = store.createRecord('offering');
      offering.setProperties({startDate, endDate, room, learnerGroups, instructorGroups, instructors, session});

      return offering.save();
    }
  }
});
