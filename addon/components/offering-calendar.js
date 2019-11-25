import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { inject as service } from '@ember/service';

const { reads } = computed;
const { map } = RSVP;

export default Component.extend({
  iliosConfig: service(),
  classNames: ['offering-calendar'],

  session: null,
  learnerGroups: null,
  startDate: null,
  endDate: null,
  showLearnerGroupEvents: true,
  showSessionEvents: true,
  namespace: reads('iliosConfig.apiNameSpace'),
  learnerGroupEvents: computed('learnerGroups.[]', async function () {
    const learnerGroups = this.get('learnerGroups');
    if (!learnerGroups) {
      return [];
    }
    const data = await map(learnerGroups, async learnerGroup => {
      const offerings = await learnerGroup.get('offerings');
      const events = await map(offerings.toArray(), async offering => {
        const session = await offering.get('session');
        const course = await session.get('course');
        const event = {
          startDate: offering.get('startDate'),
          endDate: offering.get('endDate'),
          courseTitle: course.get('title'),
          name: session.get('title'),
          offering: offering.get("id"),
          location: offering.get("location"),
          color: "#84c444",
          postrequisites: [],
          prerequisites: [],
        };

        return event;
      });

      return events;
    });

    const flat = data.reduce((flattened, obj) => {
      return flattened.pushObjects(obj.toArray());
    }, []);

    return flat;
  }),

  sessionEvents: computed('session', async function () {
    const session = this.get('session');
    if (!session) {
      return [];
    }
    const offerings = await session.get('offerings');
    const events = await map(offerings.toArray(), async offering => {
      const course = await session.get('course');
      const event = {
        startDate: offering.get('startDate'),
        endDate: offering.get('endDate'),
        courseTitle: course.get('title'),
        name: session.get('title'),
        offering: offering.get("id"),
        location: offering.get("location"),
        color: "#f6f6f6",
        postrequisites: [],
        prerequisites: [],
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
    const loc = this.get('location');
    const sessionType = await session.get('sessionType');
    const course = await session.get('course');
    return {
      startDate,
      endDate,
      courseTitle: course.get('title'),
      name: session.get('title'),
      isPublished: session.get('isPublished'),
      offering: 1,
      loc,
      color: sessionType.get('calendarColor'),
      postrequisites: [],
      prerequisites: [],
    };
  }),

  calendarEvents: computed(
    'learnerGroupEvents.[]',
    'sessionEvents.[]',
    'currentEvent',
    'showLearnerGroupEvents',
    'showSessionEvents',
    async function () {
      const currentEvent = await this.get('currentEvent');
      const showLearnerGroupEvents = await this.get('showLearnerGroupEvents');
      const showSessionEvents = await this.get('showSessionEvents');
      if(!currentEvent) {
        return [];
      }
      const events = [];
      if (showLearnerGroupEvents) {
        const learnerGroupEvents = await this.get('learnerGroupEvents');
        events.pushObjects(learnerGroupEvents);
      }
      if (showSessionEvents) {
        const sessionEvents = await this.get('sessionEvents');
        events.pushObjects(sessionEvents);
      }
      const currentEventIdentifier = currentEvent.name + currentEvent.startDate + currentEvent.endDate;
      const filteredEvents = events.filter(event => {
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
  ),
});
