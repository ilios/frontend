import Ember from 'ember';
import moment from 'moment';

const { Component, computed, inject, RSVP } = Ember;
const { reads } = computed;
const { map } = RSVP;

export default Component.extend({
  commonAjax: inject.service(),
  iliosConfig: inject.service(),
  classNames: ['user-profile-calendar'],

  namespace: reads('iliosConfig.apiNameSpace'),
  offering: null,
  learnerGroup: null,
  calendarEvents: computed('learnerGroups.[]', 'startDate', 'endDate', 'session', async function(){
    const learnerGroups = this.get('learnerGroups');
    const startDate = this.get('startDate');
    const endDate = this.get('endDate');

    let data = await map(learnerGroups, async learnerGroup => {
      let offerings = await learnerGroup.get('offerings');	  
      let events = await map(offerings.toArray(), async offering => {
        let session = await offering.get('session');
        let course = await session.get('course');
        let event = {
          startDate: offering.get('startDate'),
          endDate: offering.get('endDate'),
          courseTitle: course.get('title'),
          name: session.get('title'),
          offering: offering.get("id"),
          location: offering.get("location"),
          color: "#fefefe"
        };
        return event;
      });
      return events;
    });
	
    let flat = data.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);
	
    flat.pushObject({
      startDate, 
      endDate, 
      courseTitle: "courseTitle2", 
      name: 'title', 
      isPublished: true, 
      offering: 1, 
      location: "Parnassus2", 
      color:"#00617f"
    });
	
    //debugger	
    return flat;
  }),

  actions: {
    goForward(){
      const date = this.get('date');
      let newDate = moment(date).add(1, 'week').toDate();
      this.set('date', newDate);
    },
    goBack(){
      const date = this.get('date');
      let newDate = moment(date).subtract(1, 'week').toDate();
      this.set('date', newDate);
    },
    gotoToday(){
      let newDate = moment().toDate();
      this.set('date', newDate);
    },
  }
});
