import Component from '@glimmer/component';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { deprecate } from '@ember/debug';
import isArray from 'ember-truth-helpers/helpers/is-array';
import DailyCalendar from 'ilios-common/components/daily-calendar';
import noop from 'ilios-common/helpers/noop';
import IliosCalendarMultidayEvents from 'ilios-common/components/ilios-calendar-multiday-events';

export default class IliosCalendarDayComponent extends Component {
  @service localeDays;

  get date() {
    if (typeof this.args.date === 'string') {
      deprecate(`String passed to IliosCalendarDay @date instead of Date`, false, {
        id: 'common.dates-no-strings',
        for: 'ilios-common',
        until: '72',
        since: '71',
      });
      return DateTime.fromISO(this.args.date).toJSDate();
    }

    return this.args.date;
  }

  get today() {
    return DateTime.fromJSDate(this.date).startOf('day');
  }
  get events() {
    return this.args.calendarEvents.filter(
      (event) =>
        DateTime.fromISO(event.calendarStartDate).hasSame(this.today, 'day') ||
        DateTime.fromISO(event.calendarEndDate).hasSame(this.today, 'day'),
    );
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
    return this.events.filter((ev) => {
      return ev.postrequisites.length === 0 || !ev.ilmSession;
    });
  }

  get singleDayEvents() {
    return this.nonIlmPreWorkEvents.filter((event) =>
      DateTime.fromISO(event.calendarStartDate).hasSame(
        DateTime.fromISO(event.calendarEndDate),
        'day',
      ),
    );
  }
  get multiDayEvents() {
    return this.nonIlmPreWorkEvents.filter(
      (event) =>
        !DateTime.fromISO(event.calendarStartDate).hasSame(
          DateTime.fromISO(event.calendarEndDate),
          'day',
        ),
    );
  }
  <template>
    {{#if (isArray @calendarEvents)}}
      <div class="ilios-calendar-day" data-test-ilios-calendar-day>
        <DailyCalendar
          @isLoadingEvents={{@isLoadingEvents}}
          @date={{this.date}}
          @events={{this.singleDayEvents}}
          @selectEvent={{if @areEventsSelectable @selectEvent (noop)}}
        />
        <IliosCalendarMultidayEvents
          @events={{this.multiDayEvents}}
          @selectEvent={{@selectEvent}}
          @areEventsSelectable={{@areEventsSelectable}}
        />
      </div>
    {{/if}}
  </template>
}
