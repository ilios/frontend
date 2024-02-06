import Component from '@glimmer/component';
import moment from 'moment';
import { action } from '@ember/object';
import { deprecate } from '@ember/debug';
import { DateTime } from 'luxon';

export default class TimePicker extends Component {
  constructor() {
    super(...arguments);
    this.now = new Date();
    this.hours = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
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
    this.ampms = ['am', 'pm'];
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
    return moment(this.date).format('h');
  }

  get minute() {
    return moment(this.date).format('mm');
  }

  get ampm() {
    return moment(this.date).format('a');
  }

  @action
  changeHour(event) {
    let hour = parseInt(event.target.value, 10);
    const ampm = this.ampm;

    if (ampm === 'pm') {
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
    const hour = moment(this.date).hours();

    if (value !== currentValue) {
      if (value === 'am') {
        this.args.action(hour - 12, 'hour');
      } else {
        this.args.action(hour + 12, 'hour');
      }
    }
  }
}
