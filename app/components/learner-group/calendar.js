import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { DateTime } from 'luxon';
import { all, map } from 'rsvp';
import { mapBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

export default class LearnerGroupCalendarComponent extends Component {
  @tracked selectedDate = DateTime.now();
  @tracked showSubgroupEvents = false;

  @cached
  get eventsData() {
    return new TrackedAsyncData(this.loadEvents(this.args.learnerGroup, this.showSubgroupEvents));
  }

  get events() {
    return this.eventsData.isResolved ? this.eventsData.value : [];
  }

  get date() {
    return this.selectedDate.toJSDate();
  }

  async loadEvents(learnerGroup, showSubgroupEvents) {
    let learnerGroups = [learnerGroup];
    if (showSubgroupEvents) {
      const allDescendants = await learnerGroup.get('allDescendants');
      learnerGroups = [...learnerGroups, ...allDescendants];
    }
    const offerings = await all(mapBy(learnerGroups, 'offerings'));
    const flat = offerings.reduce((flattened, obj) => {
      return [...flattened, ...obj.slice()];
    }, []);
    return await map(flat, async (offering) => {
      const session = await offering.session;
      const course = await session.course;
      return {
        startDate: offering.startDate.toISOString(),
        endDate: offering.endDate.toISOString(),
        courseTitle: course.title,
        name: session.title,
        offering: offering.id,
        location: offering.location,
        color: '#84c444',
        prerequisites: [],
        postrequisites: [],
        isScheduled: session.isScheduled || course.isScheduled,
        isPublished: session.isPublished && course.isPublished,
        isBlanked: false,
      };
    });
  }

  @action
  goForward() {
    this.selectedDate = DateTime.fromISO(this.selectedDate).plus({ weeks: 1 });
  }
  @action
  goBack() {
    this.selectedDate = DateTime.fromISO(this.selectedDate).minus({ weeks: 1 });
  }
  @action
  gotoToday() {
    this.selectedDate = DateTime.now();
  }
}
