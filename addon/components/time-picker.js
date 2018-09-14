/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import moment from 'moment';
import momentFormat from 'ember-moment/computeds/format';
import layout from '../templates/components/time-picker';

export default Component.extend({
  layout,
  classNames: ['time-picker'],
  init() {
    this._super(...arguments);
    this.set('hours', ['1','2','3','4','5','6','7','8','9','10','11','12']);
    this.set('minutes', ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59']);
    this.set('ampms', ['am', 'pm']);
  },

  date: null,

  hour: momentFormat('date', 'h'),
  minute: momentFormat('date', 'mm'),
  ampm: momentFormat('date', 'a'),

  hours: null,
  minutes: null,
  ampms: null,

  actions: {
    changeHour(string) {
      let hour = parseInt(string, 10);
      const ampm = this.get('ampm');

      if (ampm === 'pm') {
        hour += 12;
      }

      this.sendAction('action', hour, 'hour');
    },

    changeMinute(string) {
      const minute = parseInt(string, 10);
      this.sendAction('action', minute, 'minute');
    },

    changeAmPm(value) {
      const currentValue = this.get('ampm');
      const hour = moment(this.get('date')).hours();

      if (value != currentValue) {
        if (value === 'am') {
          this.sendAction('action', hour - 12, 'hour');
        } else {
          this.sendAction('action', hour + 12, 'hour');
        }
      }
    }
  }
});
