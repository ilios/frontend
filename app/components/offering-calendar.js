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
	learnerGroupEvents: computed('learnerGroups.[]', 'startDate', 'endDate', async function () {
	    const learnerGroups = this.get('learnerGroups');
		if (!learnerGroups) {
			return []
		}
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
	          color: "#84c444"
	        };

	        return event;
	      });

	      return events;
	    });

	    let flat = data.reduce((flattened, obj) => {
	      return flattened.pushObjects(obj.toArray());
	    }, []);

	    return flat;
	  }),

	  sessionEvents: computed('session', async function () {
	    const session = this.get('session');
		if (!session) {
			return []
		}
	    const offerings = await session.get('offerings');
	    let events = await map(offerings.toArray(), async offering => {
	      let course = await session.get('course');
	      let event = {
	        startDate: offering.get('startDate'),
	        endDate: offering.get('endDate'),
	        courseTitle: course.get('title'),
	        name: session.get('title'),
	        offering: offering.get("id"),
	        location: offering.get("location"),
	        color: "#f6f6f6"
	      };

	      return event;
	    });

	    return events;
	  }),

	  currentEvent: computed('startDate', 'endDate', 'location', 'session', async function () {
	    const startDate = this.get('startDate');
	    const endDate = this.get('endDate');
	    const session = this.get('session');
		if (!session) {
			return null;
		}
	    const location = this.get('location');
	    const sessionType = await session.get('sessionType');
	    const course = await session.get('course');
	    return {
	      startDate,
	      endDate,
	      courseTitle: course.get('title'),
	      name: session.get('title'),
	      isPublished: session.get('isPublished'),
	      offering: 1,
	      location,
	      color: sessionType.get('calendarColor')
	    };
	  }),

	  calendarEvents: computed('learnerGroupEvents.[]', 'sessionEvents.[]', 'currentEvent', async function(){
	    
		  try {
		const learnerGroupEvents = await this.get('learnerGroupEvents');
	    const sessionEvents = await this.get('sessionEvents');
	    const currentEvent = await this.get('currentEvent');
		
		if(!currentEvent) {
			return [];
		}
		
	    const events = [].concat(learnerGroupEvents, sessionEvents);
        
		const currentEventIdentifier = currentEvent.name + currentEvent.startDate + currentEvent.endDate;
		
		let filteredEvents = events.filter(event => {
			if(!event) {
				return false;
			}
			
			const eventIdentifier = event.name + event.startDate + event.endDate;
			
			if(eventIdentifier === currentEventIdentifier) {
				return false;
			}
			return true;
		});
		
        filteredEvents.pushObject(currentEvent);		
		return filteredEvents;
	}
	catch(e) {debugger}
	  }),
	  
});
