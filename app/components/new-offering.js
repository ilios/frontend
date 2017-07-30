import Ember from 'ember';

const { Component} = Ember;

export default Component.extend({
  store: Ember.inject.service(),
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
