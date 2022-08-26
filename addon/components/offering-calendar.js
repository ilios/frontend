import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { map } from 'rsvp';

export default class OfferingCalendar extends Component {
  @tracked showLearnerGroupEvents = true;
  @tracked showSessionEvents = true;
  @tracked learnerGroupEvents = [];
  @tracked sessionEvents = [];
  @tracked currentEvent = null;

  get calendarEvents() {
    if (!this.currentEvent) {
      return [];
    }
    let events = [];
    if (this.showLearnerGroupEvents) {
      events = [...events, ...this.learnerGroupEvents];
    }
    if (this.showSessionEvents) {
      events = [...events, ...this.sessionEvents];
    }
    const currentEventIdentifier =
      this.currentEvent.name + this.currentEvent.startDate + this.currentEvent.endDate;
    const filteredEvents = events.filter((event) => {
      if (!event) {
        return false;
      }
      const eventIdentifier = event.name + event.startDate + event.endDate;
      return eventIdentifier !== currentEventIdentifier;
    });

    return [...filteredEvents, this.currentEvent];
  }

  load = restartableTask(async (element, [startDate, endDate, learnerGroups, session]) => {
    if (!learnerGroups) {
      this.learnerGroupEvents = [];
    } else {
      const data = await map(learnerGroups, async (learnerGroup) => {
        const offerings = await learnerGroup.offerings;
        return await map(offerings.toArray(), async (offering) => {
          const session = await offering.session;
          const course = await session.course;
          return {
            startDate: offering.startDate,
            endDate: offering.endDate,
            courseTitle: course.title,
            name: session.title,
            offering: offering.id,
            location: offering.location,
            color: '#84c444',
            postrequisites: [],
            prerequisites: [],
          };
        });
      });

      this.learnerGroupEvents = data.reduce((flattened, obj) => {
        return [...flattened, ...obj.toArray()];
      }, []);
    }

    if (!session) {
      this.sessionEvents = [];
      this.currentEvent = null;
    } else {
      const offerings = await session.offerings;
      const sessionType = await session.sessionType;
      const course = await session.course;
      this.sessionEvents = await map(offerings.toArray(), async (offering) => {
        return {
          startDate: offering.startDate,
          endDate: offering.endDate,
          courseTitle: course.title,
          name: session.title,
          offering: offering.id,
          location: offering.location,
          color: '#f6f6f6',
          postrequisites: [],
          prerequisites: [],
        };
      });

      this.currentEvent = {
        startDate,
        endDate,
        courseTitle: course.title,
        name: session.title,
        isPublished: session.isPublished,
        offering: 1,
        location: '',
        color: sessionType.calendarColor,
        postrequisites: [],
        prerequisites: [],
      };
    }
  });
}
