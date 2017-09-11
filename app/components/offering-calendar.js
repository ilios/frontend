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
	
	let flat = []

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
		flat.pushObject(event);
      });
    });
				
	const session = this.get("session");
	
	let offerings = session.get('offerings');

    let events = await map(offerings.toArray(), async offering => {
      let session = await offering.get('session');
      let course = await session.get('course');
      let event = {
        startDate: offering.get('startDate'),
		endDate:  moment(offering.get('endDate'), "DD-MM-YYYY").add(1, 'hours'),
        courseTitle: course.get('title'),
        name: session.get('title'),
        offering: offering.get("id"),
        location: offering.get("location"),
        color: "#fefefe"
      };
	  flat.pushObject(event);
	  
	  // hangs on this
	  /*
	  let offeringLearnerGroups = await offering.get('learnerGroups');
	  	  debugger
	  
	      let data2 = await map(offeringLearnerGroups, async learnerGroup2 => {
	        let offerings2 = await learnerGroup2.get('offerings');	  
	        let events2 = await map(offerings2.toArray(), async offering2 => {
	          let session2 = await offering2.get('session');
	          let course2 = await session2.get('course');
	          let event2 = {
	            startDate: offering2.get('startDate'),
	            endDate: offering2.get('endDate'),
	            courseTitle: course2.get('title'),
	            name: session2.get('title'),
	            offering: offering2.get("id"),
	            location: offering2.get("location"),
	            color: "#fefefe"
	          };
	  		flat.pushObject(event2);
	        });
	      });
	  
	  debugger
	  */
	  
	  let offeringInstructorGroups = await offering.get('instructorGroups');
	  
	  
	  
	  debugger
	  
    });
	/*
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
	*/
		
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
