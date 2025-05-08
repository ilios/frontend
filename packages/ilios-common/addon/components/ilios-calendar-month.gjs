import Component from '@glimmer/component';
import { DateTime } from 'luxon';
import { action } from '@ember/object';

export default class IliosCalendarMonthComponent extends Component {
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
      DateTime.fromISO(event.startDate).hasSame(DateTime.fromISO(event.endDate), 'day'),
    );
  }

  get multiDayEventsList() {
    return this.nonIlmPreWorkEvents.filter(
      (event) => !DateTime.fromISO(event.startDate).hasSame(DateTime.fromISO(event.endDate), 'day'),
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

{{#if (is-array @calendarEvents)}}
  <div class="ilios-calendar-month" data-test-ilios-calendar-month>
    <MonthlyCalendar
      @isLoadingEvents={{@isLoadingEvents}}
      @date={{@date}}
      @events={{this.singleDayEvents}}
      @changeToDayView={{this.changeToDayView}}
      @selectEvent={{@selectEvent}}
    />

    <IliosCalendarMultidayEvents
      @events={{this.multiDayEventsList}}
      @selectEvent={{@selectEvent}}
      @areEventsSelectable={{@areDaysSelectable}}
    />
  </div>
{{/if}}