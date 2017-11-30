import Component from '@ember/component';
import moment from 'moment';
import momentFormat from 'ember-moment/computeds/format';

export default Component.extend({
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
    changeHour() {
      const select = this.$('select')[0];
      const selectedIndex = select.selectedIndex;
      const hours = this.get('hours');
      const ampm = this.get('ampm');
      let hour = parseInt(hours[selectedIndex], 10);

      if (ampm === 'pm') {
        hour += 12;
      }

      this.sendAction('action', hour, 'hour');
    },

    changeMinute() {
      const select = this.$('select')[1];
      const selectedIndex = select.selectedIndex;
      const minutes = this.get('minutes');
      const minute = parseInt(minutes[selectedIndex], 10);

      this.sendAction('action', minute, 'minute');
    },

    changeAmPm() {
      const select = this.$('select')[2];
      const selectedIndex = select.selectedIndex;
      const ampms = this.get('ampms');
      const value = ampms[selectedIndex];
      const hour = moment(this.get('date')).hours();

      if (value === 'am') {
        this.sendAction('action', hour - 12, 'hour');
      } else {
        this.sendAction('action', hour + 12, 'hour');
      }
    }
  }
});
