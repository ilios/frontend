import Component from '@glimmer/component';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { tracked, cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { sortBy } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';

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
    if (this.eventsData.isResolved) {
      return sortBy(
        this.eventsData.value.map((obj) => this.userEvents.createEventFromData(obj, true)),
        ['startDate', 'name'],
      );
    }
    return [];
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
}
