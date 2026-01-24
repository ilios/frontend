import Component from '@glimmer/component';
import { DateTime } from 'luxon';
import { ensureSafeComponent } from '@embroider/util';
import IliosCalendarDay from './ilios-calendar-day';
import IliosCalendarWeek from './ilios-calendar-week';
import IliosCalendarMonth from './ilios-calendar-month';
import { LinkTo } from '@ember/routing';
import { hash, concat } from '@ember/helper';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import { faBackward, faForward } from '@fortawesome/free-solid-svg-icons';

export default class IliosCalendarComponent extends Component {
  @service intl;

  get calendarViewComponent() {
    let calendar = IliosCalendarDay;
    if (this.args.selectedView === 'week') {
      calendar = IliosCalendarWeek;
    }
    if (this.args.selectedView === 'month') {
      calendar = IliosCalendarMonth;
    }

    return ensureSafeComponent(calendar, this);
  }

  get compiledCalendarEvents() {
    if (this.args.selectedView === 'day') {
      return this.args.calendarEvents;
    } else {
      const hashedEvents = {};
      this.args.calendarEvents.forEach((event) => {
        const hash =
          DateTime.fromISO(event.startDate).toISO() +
          DateTime.fromISO(event.endDate).toISO() +
          event.name;
        if (!(hash in hashedEvents)) {
          hashedEvents[hash] = [];
        }
        hashedEvents[hash].push(event);
      });
      const compiledEvents = [];
      let hash;
      for (hash in hashedEvents) {
        const arr = hashedEvents[hash];
        const event = arr[0];
        if (arr.length > 1) {
          event.isMulti = true;
        }
        compiledEvents.push(event);
      }
      return compiledEvents;
    }
  }

  get sortedEvents() {
    return this.compiledCalendarEvents.sort((a, b) => {
      const aStartDate = DateTime.fromISO(a.startDate);
      const bStartDate = DateTime.fromISO(b.startDate);
      let diff = aStartDate > bStartDate ? 1 : aStartDate < bStartDate ? -1 : 0;
      if (diff) {
        return diff;
      }

      const aEndDate = DateTime.fromISO(a.endDate);
      const bEndDate = DateTime.fromISO(b.endDate);
      diff = aEndDate > bEndDate ? 1 : aEndDate < bEndDate ? -1 : 0;
      if (diff) {
        return diff;
      }

      return a.title - b.title;
    });
  }

  get forwardDate() {
    return DateTime.fromJSDate(this.args.selectedDate)
      .plus(this.viewOpts(this.args.selectedView, 1))
      .toFormat('yyyy-MM-dd');
  }
  get backDate() {
    return DateTime.fromJSDate(this.args.selectedDate)
      .minus(this.viewOpts(this.args.selectedView, 1))
      .toFormat('yyyy-MM-dd');
  }
  get todayDate() {
    return DateTime.now().toFormat('yyyy-MM-dd');
  }

  get viewTypes() {
    return [
      { id: 'day', label: this.intl.t('general.day') },
      { id: 'week', label: this.intl.t('general.week') },
      { id: 'month', label: this.intl.t('general.month') },
    ];
  }

  viewOpts(view, value) {
    let opts = {};
    switch (view) {
      case 'month':
        opts = { month: value };
        break;
      case 'week':
        opts = { week: value };
        break;
      case 'day':
        opts = { day: value };
        break;
    }
    return opts;
  }
  <template>
    <div class="ilios-calendar" data-test-ilios-calendar>
      <div class="ilios-calendar-pickers">
        <ul class="inline calendar-time-picker">
          <li>
            <LinkTo
              @route="dashboard.calendar"
              @query={{hash date=this.backDate}}
              data-test-go-back
            >
              <FaIcon @title={{t "general.back"}} @icon={{faBackward}} />
            </LinkTo>
          </li>
          <li>
            <LinkTo
              @route="dashboard.calendar"
              @query={{hash date=this.todayDate}}
              data-test-go-to-today
            >
              {{t "general.today"}}
            </LinkTo>
          </li>
          <li>
            <LinkTo
              @route="dashboard.calendar"
              @query={{hash date=this.forwardDate}}
              data-test-go-forward
            >
              <FaIcon @title={{t "general.forward"}} @icon={{faForward}} />
            </LinkTo>
          </li>
        </ul>
        <ul class="inline calendar-view-picker">
          {{#each this.viewTypes as |viewType|}}
            <li data-test-view-mode>
              {{#if (eq @selectedView viewType.id)}}
                {{t (concat "general." viewType.id)}}
              {{else}}
                <LinkTo @route="dashboard.calendar" @query={{hash view=viewType.id}}>
                  {{viewType.label}}</LinkTo>
              {{/if}}
            </li>
          {{/each}}
        </ul>
      </div>
      <div class="ilios-calendar-calendar">
        <this.calendarViewComponent
          @isLoadingEvents={{@isLoadingEvents}}
          @calendarEvents={{this.sortedEvents}}
          @date={{@selectedDate}}
          @selectEvent={{@selectEvent}}
          @changeDate={{@changeDate}}
          @changeView={{@changeView}}
          @areDaysSelectable={{true}}
          @areEventsSelectable={{true}}
        />
      </div>
    </div>
  </template>
}
