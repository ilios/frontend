import Component from '@glimmer/component';
import { action } from '@ember/object';
import { deprecate } from '@ember/debug';
import { DateTime } from 'luxon';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import isEqual from 'ember-truth-helpers/helpers/is-equal';

export default class TimePicker extends Component {
  constructor() {
    super(...arguments);
    this.now = new Date();
    this.hours = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
    this.minutes = [
      '00',
      '01',
      '02',
      '03',
      '04',
      '05',
      '06',
      '07',
      '08',
      '09',
      '10',
      '11',
      '12',
      '13',
      '14',
      '15',
      '16',
      '17',
      '18',
      '19',
      '20',
      '21',
      '22',
      '23',
      '24',
      '25',
      '26',
      '27',
      '28',
      '29',
      '30',
      '31',
      '32',
      '33',
      '34',
      '35',
      '36',
      '37',
      '38',
      '39',
      '40',
      '41',
      '42',
      '43',
      '44',
      '45',
      '46',
      '47',
      '48',
      '49',
      '50',
      '51',
      '52',
      '53',
      '54',
      '55',
      '56',
      '57',
      '58',
      '59',
    ];
    this.ampms = ['AM', 'PM'];
  }

  get date() {
    if (typeof this.args.date === 'string') {
      deprecate(`String passed to TimePicker @date instead of Date`, false, {
        id: 'common.dates-no-strings',
        for: 'ilios-common',
        until: '72',
        since: '71',
      });
      return DateTime.fromISO(this.args.date).toJSDate();
    }

    return this.args.date;
  }

  get hour() {
    return DateTime.fromJSDate(this.date).toFormat('hh');
  }

  get minute() {
    return DateTime.fromJSDate(this.date).toFormat('mm');
  }

  get ampm() {
    return DateTime.fromJSDate(this.date).toFormat('a');
  }

  @action
  changeHour(event) {
    let hour = parseInt(event.target.value, 10);
    const ampm = this.ampm;

    if (ampm === 'PM') {
      hour += 12;
    }

    this.args.action(hour, 'hour');
  }

  @action
  changeMinute(event) {
    const minute = parseInt(event.target.value, 10);
    this.args.action(minute, 'minute');
  }

  @action
  changeAmPm(event) {
    const value = event.target.value;
    const currentValue = this.ampm;
    const hour = DateTime.fromJSDate(this.date).hour;

    if (value !== currentValue) {
      if (value === 'AM') {
        this.args.action(hour - 12, 'hour');
      } else {
        this.args.action(hour + 12, 'hour');
      }
    }
  }
  <template>
    <div class="time-picker" data-test-time-picker>
      <select
        class="hour"
        aria-label={{t "general.hour"}}
        {{on "change" this.changeHour}}
        data-test-hour
      >
        {{#each this.hours as |listHour|}}
          <option value={{listHour}} selected={{isEqual listHour this.hour}}>
            {{listHour}}
          </option>
        {{/each}}
      </select>
      <select
        class="minute"
        aria-label={{t "general.minute"}}
        {{on "change" this.changeMinute}}
        data-test-minute
      >
        {{#each this.minutes as |listMinute|}}
          <option value={{listMinute}} selected={{isEqual listMinute this.minute}}>
            {{listMinute}}
          </option>
        {{/each}}
      </select>
      <select
        class="ampm"
        aria-label={{t "general.beforeOrAfterMidday"}}
        {{on "change" this.changeAmPm}}
        data-test-ampm
      >
        {{#each this.ampms as |listAmPm|}}
          <option value={{listAmPm}} selected={{isEqual listAmPm this.ampm}}>
            {{listAmPm}}
          </option>
        {{/each}}
      </select>
    </div>
  </template>
}
