import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { sortBy } from 'ilios-common/utils/array-helpers';

export default class UserProfileCalendar extends Component {
  @service fetch;
  @service iliosConfig;
  @service userEvents;
  @tracked date;
  @tracked calendarEvents;

  constructor() {
    super(...arguments);
    this.date = new Date();
  }

  @dropTask
  *load() {
    const from = moment(this.date).day(0).hour(0).minute(0).second(0).format('X');
    const to = moment(this.date).day(6).hour(23).minute(59).second(59).format('X');

    let url = '';
    if (this.iliosConfig.apiNameSpace) {
      url += '/' + this.iliosConfig.apiNameSpace;
    }
    url += '/userevents/' + this.args.user.get('id') + '?from=' + from + '&to=' + to;
    const data = yield this.fetch.getJsonFromApiHost(url);
    this.calendarEvents = sortBy(
      data.userEvents.map((obj) => this.userEvents.createEventFromData(obj, true)),
      ['startDate', 'name']
    );
  }
  @action
  goForward() {
    const newDate = moment(this.date).add(1, 'week').toDate();
    this.date = newDate;
  }

  @action
  goBack() {
    const newDate = moment(this.date).subtract(1, 'week').toDate();
    this.date = newDate;
  }

  @action
  gotoToday() {
    const newDate = moment().toDate();
    this.date = newDate;
  }
}
