import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { map } from 'rsvp';
import { DateTime } from 'luxon';
import { TrackedAsyncData } from 'ember-async-data';

export default class OfferingCalendar extends Component {
  @tracked showLearnerGroupEvents = true;
  @tracked showSessionEvents = true;
  @tracked learnerGroupEvents = [];
  @tracked sessionEvents = [];
  @tracked currentEvent = null;

  @cached
  get calendarEventsData() {
    return new TrackedAsyncData(
      this.loadData(
        this.args.startDate,
        this.args.endDate,
        this.args.learnerGroups,
        this.args.session,
      ),
    );
  }

  async loadData(startDate, endDate, learnerGroups, session) {
    if (!learnerGroups) {
      this.learnerGroupEvents = [];
    } else {
      const data = await map(learnerGroups, async (learnerGroup) => {
        const offerings = await learnerGroup.offerings;
        return await map(offerings, async (offering) => {
          const session = await offering.session;
          const course = await session.course;
          return {
            startDate: DateTime.fromJSDate(offering.startDate).toISO(),
            endDate: DateTime.fromJSDate(offering.endDate).toISO(),
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
        return [...flattened, ...obj];
      }, []);
    }

    if (!session) {
      this.sessionEvents = [];
      this.currentEvent = null;
    } else {
      const offerings = await session.offerings;
      const sessionType = await session.sessionType;
      const course = await session.course;
      this.sessionEvents = await map(offerings, async (offering) => {
        return {
          startDate: DateTime.fromJSDate(offering.startDate).toISO(),
          endDate: DateTime.fromJSDate(offering.endDate).toISO(),
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
        startDate: DateTime.fromJSDate(startDate).toISO(),
        endDate: DateTime.fromJSDate(endDate).toISO(),
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
  }

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
}
