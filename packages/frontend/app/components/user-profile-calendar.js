import Component from '@glimmer/component';
import { service } from '@ember/service';
import { DateTime } from 'luxon';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class UserProfileCalendar extends Component {
  @service fetch;
  @service iliosConfig;
  @service userEvents;
  @tracked date = new Date();
  @tracked calendarEvents;

  load = dropTask(async () => {
    const from = DateTime.fromJSDate(this.date).startOf('week').toSeconds();
    const to = DateTime.fromJSDate(this.date).endOf('week').toSeconds();
    let url = '';
    if (this.iliosConfig.apiNameSpace) {
      url += '/' + this.iliosConfig.apiNameSpace;
    }
    url += '/userevents/' + this.args.user.get('id') + '?from=' + from + '&to=' + to;
    const data = await this.fetch.getJsonFromApiHost(url);
    this.calendarEvents = sortBy(
      data.userEvents.map((obj) => this.userEvents.createEventFromData(obj, true)),
      ['startDate', 'name'],
    );
  });

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
