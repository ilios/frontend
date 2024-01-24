import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';
import { map } from 'rsvp';
import { deprecate } from '@ember/debug';
import { DateTime } from 'luxon';

export default class OfferingCalendar extends Component {
  @tracked showLearnerGroupEvents = true;
  @tracked showSessionEvents = true;
  @tracked learnerGroupEvents = [];
  @tracked sessionEvents = [];
  @tracked currentEvent = null;

  get startDate() {
    if (typeof this.args.startDate === 'string') {
      deprecate(`String passed to OfferingCalendar @startDate instead of Date`, false, {
        id: 'common.dates-no-strings',
        for: 'ilios-common',
        until: '72',
        since: '71',
      });
      return DateTime.fromISO(this.args.startDate).toJSDate();
    }

    return this.args.startDate;
  }

  get endDate() {
    if (typeof this.args.endDate === 'string') {
      deprecate(`String passed to OfferingCalendar @endDate instead of Date`, false, {
        id: 'common.dates-no-strings',
        for: 'ilios-common',
        until: '72',
        since: '71',
      });
      return DateTime.fromISO(this.args.endDate).toJSDate();
    }

    return this.args.endDate;
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

  load = restartableTask(async (element, [startDate, endDate, learnerGroups, session]) => {
    if (!learnerGroups) {
      this.learnerGroupEvents = [];
    } else {
      const data = await map(learnerGroups, async (learnerGroup) => {
        const offerings = await learnerGroup.offerings;
        return await map(offerings.slice(), async (offering) => {
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
        return [...flattened, ...obj.slice()];
      }, []);
    }

    if (!session) {
      this.sessionEvents = [];
      this.currentEvent = null;
    } else {
      const offerings = await session.offerings;
      const sessionType = await session.sessionType;
      const course = await session.course;
      this.sessionEvents = await map(offerings.slice(), async (offering) => {
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
  });
}
