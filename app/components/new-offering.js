import Ember from 'ember';

const { Component, RSVP, inject } = Ember;
const { service } = inject;
const { all } = RSVP;

export default Component.extend({
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
      const smallGroupMode = this.get('smallGroupMode');
      if (smallGroupMode) {
        let offerings = learnerGroups.map(learnerGroup => {
          let offering = store.createRecord('offering');
          offering.setProperties({startDate, endDate, room, session});
          offering.get('learnerGroups').pushObject(learnerGroup);

          return offering;
        });

        return all(offerings.invoke('save'));
      } else {
        let offering = store.createRecord('offering');
        offering.setProperties({startDate, endDate, room, learnerGroups, instructorGroups, instructors, session});

        return offering.save();
      }
    }
  }
});
