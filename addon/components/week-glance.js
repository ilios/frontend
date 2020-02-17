import { inject as service } from '@ember/service';
import Component from '@glimmer/component';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';

export default class WeeklyGlance extends Component {
  @service userEvents;
  @service intl;

  @tracked publishedWeekEvents;
  @tracked midnightAtTheStartOfThisWeek;
  @tracked midnightAtTheEndOfThisWeek;

  @restartableTask
  *load(element, [week, year]) {
    // @todo does this still hold true? verify. [ST 2019/12/04]
    this.intl; //we need to use the service so the CP will re-fire
    const thursdayOfTheWeek = moment();
    thursdayOfTheWeek.year(year);
    thursdayOfTheWeek.day(4);
    thursdayOfTheWeek.isoWeek(week);
    thursdayOfTheWeek.hour(0).minute(0);

    this.midnightAtTheStartOfThisWeek = thursdayOfTheWeek.clone().subtract(4, 'days');
    this.midnightAtTheEndOfThisWeek = thursdayOfTheWeek.clone().add(2, 'days').hour(23).minute(59);

    const weekEvents =  yield this.userEvents.getEvents(
      this.midnightAtTheStartOfThisWeek.unix(),
      this.midnightAtTheEndOfThisWeek.unix()
    );
    this.publishedWeekEvents = weekEvents.filter(ev => {
      return !ev.isBlanked && ev.isPublished && !ev.isScheduled;
    });
  }

  get title() {
    if (!this.midnightAtTheStartOfThisWeek && !this.midnightAtTheEndOfThisWeek) {
      return '';
    }

    const from = this.midnightAtTheStartOfThisWeek.format('MMMM D');
    let to;
    if (this.midnightAtTheStartOfThisWeek.month() !== this.midnightAtTheEndOfThisWeek.month()) {
      to = this.midnightAtTheEndOfThisWeek.format('MMMM D');
      return `${from} - ${to}`;
    }
    to = this.midnightAtTheEndOfThisWeek.format('D');
    return `${from}-${to}`;
  }

  get ilmPreWork() {
    const rhett = [];

    if (!this.publishedWeekEvents) {
      return rhett;
    }

    const preWork =  this.publishedWeekEvents.reduce((arr, eventObject) => {
      return arr.pushObjects(eventObject.prerequisites);
    }, []);

    // grab ILMs only, and group them by session.
    const groups = {};
    preWork.filter(ev => ev.ilmSession).forEach(ilm => {
      if (! Object.prototype.hasOwnProperty.call(groups, ilm.session)) {
        groups[ilm.session] = [];
      }
      groups[ilm.session].pushObject(ilm);
    });

    // return an array of arrays of ILMs.
    const sessions = Object.getOwnPropertyNames(groups);
    sessions.forEach(session => {
      rhett.push(groups[session]);
    });


    return rhett.sort((ilmGroupA, ilmGroupB) => {
      const eventA = ilmGroupA.firstObject;
      const eventB = ilmGroupB.firstObject;

      if (eventA.startDate > eventB.startDate) {
        return 1;
      } else if (eventA.startDate < eventB.startDate) {
        return -1;
      }

      if (eventA.postrequisiteName > eventB.postrequisiteName) {
        return 1;
      }
      else if (eventA.postrequisiteName < eventB.postrequisiteName) {
        return -1;
      }

      if (eventA.session > eventB.session) {
        return 1;
      } else {
        return -1;
      }
    });
  }

  get nonIlmPreWorkEvents() {
    if (!this.publishedWeekEvents) {
      return [];
    }
    return this.publishedWeekEvents.filter(ev => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }
}
