import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import moment from 'moment';
import { all, map } from 'rsvp';
import { mapBy } from 'ilios-common/utils/array-helpers';

export default class IliosCalendarWeekComponent extends Component {
  @tracked selectedDate = moment().toDate();
  @tracked showSubgroupEvents = false;
  @tracked offerings = [];
  @tracked calendarEvents = [];

  load = dropTask(async (element, [learnerGroup, showSubgroupEvents]) => {
    if (!learnerGroup) {
      return;
    }
    this.offerings = await this.getOfferings(learnerGroup, showSubgroupEvents);
    this.calendarEvents = await this.getCalendarEvents(this.offerings);
  });

  async getOfferings(learnerGroup, showSubgroupEvents) {
    let learnerGroups = [learnerGroup];
    if (showSubgroupEvents) {
      const allDescendants = await learnerGroup.get('allDescendants');
      learnerGroups = [...learnerGroups, ...allDescendants];
    }
    const offerings = await all(mapBy(learnerGroups, 'offerings'));
    const flat = offerings.reduce((flattened, obj) => {
      return [...flattened, ...obj.slice()];
    }, []);

    return flat;
  }

  async getCalendarEvents(offerings) {
    return await map(offerings, async (offering) => {
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
        prerequisites: [],
        postrequisites: [],
      };
    });
  }

  @action
  goForward() {
    this.selectedDate = moment(this.selectedDate).add(1, 'week').toDate();
  }
  @action
  goBack() {
    this.selectedDate = moment(this.selectedDate).subtract(1, 'week').toDate();
  }
  @action
  gotoToday() {
    this.selectedDate = moment().toDate();
  }
}
