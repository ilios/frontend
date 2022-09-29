import Component from '@glimmer/component';
import moment from 'moment';
import { action } from '@ember/object';
import { deprecate } from '@ember/debug';
import { DateTime } from 'luxon';

export default class IliosCalendarWeekComponent extends Component {
  get date() {
    if (typeof this.args.date === 'string') {
      deprecate(`String passed to IliosCalendarWeek @date instead of Date`, false, {
        id: 'common.dates-no-strings',
        for: 'ilios-common',
        until: '72',
        since: '71',
      });
      return DateTime.fromISO(this.args.date).toJSDate();
    }

    return this.args.date;
  }

  get weekOf() {
    return moment(this.date).startOf('week').format('MMMM Do YYYY');
  }
  get ilmPreWorkEvents() {
    const preWork = this.args.calendarEvents.reduce((arr, ev) => {
      if (!ev.isBlanked && ev.isPublished && !ev.isScheduled) {
        arr = [...arr, ...ev.prerequisites];
      }
      return arr;
    }, []);

    return preWork
      .filter((ev) => ev.ilmSession)
      .filter((ev) => {
        return !ev.isBlanked && ev.isPublished && !ev.isScheduled;
      });
  }

  get nonIlmPreWorkEvents() {
    return this.args.calendarEvents.filter((ev) => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }
  get singleDayEvents() {
    return this.nonIlmPreWorkEvents.filter((event) =>
      moment(event.startDate).isSame(moment(event.endDate), 'day')
    );
  }
  get multiDayEventsList() {
    return this.nonIlmPreWorkEvents.filter(
      (event) => !moment(event.startDate).isSame(moment(event.endDate), 'day')
    );
  }

  @action
  changeToDayView(date) {
    if (this.args.areDaysSelectable && this.args.changeDate && this.args.changeView) {
      this.args.changeDate(date);
      this.args.changeView('day');
    }
  }
}
