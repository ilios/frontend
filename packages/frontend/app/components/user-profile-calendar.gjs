import Component from '@glimmer/component';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { tracked, cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import IliosCalendarWeek from 'ilios-common/components/ilios-calendar-week';
import Event from 'ilios-common/classes/event';

export default class UserProfileCalendar extends Component {
  @service fetch;
  @service iliosConfig;
  @service userEvents;
  @service localeDays;

  @tracked date = new Date();

  @cached
  get eventsData() {
    return new TrackedAsyncData(
      this.loadEvents(this.date, this.iliosConfig.apiNameSpace, this.args.user.id),
    );
  }

  get calendarEvents() {
    if (this.eventsData.isResolved && this.eventsData.value) {
      return sortBy(
        this.eventsData.value.map((obj) => new Event(obj, true)),
        ['startDate', 'name'],
      );
    } else {
      return [];
    }
  }

  async loadEvents(date, apiNameSpace, userId) {
    const from = DateTime.fromJSDate(this.localeDays.firstDayOfDateWeek(date)).toUnixInteger();
    const to = DateTime.fromJSDate(this.localeDays.lastDayOfDateWeek(date)).toUnixInteger();

    let url = '';
    if (apiNameSpace) {
      url += '/' + apiNameSpace;
    }
    url += '/userevents/' + userId + '?from=' + from + '&to=' + to;
    const { userEvents } = await this.fetch.getJsonFromApiHost(url);

    return userEvents;
  }

  @action
  goForward() {
    this.date = DateTime.fromJSDate(this.date).plus({ weeks: 1 }).toJSDate();
  }
  @action
  goBack() {
    this.date = DateTime.fromJSDate(this.date).minus({ weeks: 1 }).toJSDate();
  }
  @action
  gotoToday() {
    this.date = new Date();
  }
  <template>
    <div class="user-profile-calendar" data-test-user-profile-calendar>
      <ul class="calendar-time-picker">
        <li>
          <button
            class="link-button"
            type="button"
            aria-label={{t "general.back"}}
            {{on "click" this.goBack}}
            data-test-go-back
          >
            <FaIcon @icon="backward" @title={{t "general.back"}} />
          </button>
        </li>
        <li>
          <button
            class="link-button"
            type="button"
            {{on "click" this.gotoToday}}
            data-test-go-today
          >
            {{t "general.today"}}
          </button>
        </li>
        <li>
          <button
            class="link-button"
            type="button"
            aria-label={{t "general.forward"}}
            {{on "click" this.goForward}}
            data-test-go-forward
          >
            <FaIcon @icon="forward" @title={{t "general.forward"}} />
          </button>
        </li>
      </ul>
      <div class="ilios-calendar">
        <IliosCalendarWeek
          @calendarEvents={{this.calendarEvents}}
          @date={{this.date}}
          @areEventsSelectable={{false}}
          @areDaysSelectable={{false}}
          @isLoadingEvents={{this.eventsData.isPending}}
        />
      </div>
    </div>
  </template>
}
