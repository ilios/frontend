/* global moment */
import Ember from 'ember';
import { moment as momentHelper } from 'ember-moment/computed';

export default Ember.Component.extend({
  classNames: ['time-picker'],
  date: null,
  hour: momentHelper('date', 'h'),
  minute: momentHelper('date', 'mm'),
  ampm: momentHelper('date', 'a'),
  hours: ['1','2','3','4','5','6','7','8','9','10','11','12'],
  minutes: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'],
  ampms: ['am', 'pm'],
  actions: {
    changeHour(){
      let select = this.$('select')[0];
      let selectedIndex = select.selectedIndex;
      let hours = this.get('hours');
      let hour = hours[selectedIndex];

      if(this.get('ampm') === 'PM'){
        hour += 12;
      }
      let ourDate = moment(this.get('date'));
      let newDate = ourDate.hour(hour).toDate();
      this.set('date', newDate);
      this.sendAction('action', this.get('date'));
    },
    changeMinute(){
      let select = this.$('select')[1];
      let selectedIndex = select.selectedIndex;
      let minutes = this.get('minutes');
      let minute = minutes[selectedIndex];
      this.set('date', moment(this.get('date')).minute(minute).toDate());
      this.sendAction('action', this.get('date'));
    },
    changeAmPm(){
      let select = this.$('select')[2];
      let selectedIndex = select.selectedIndex;
      let ampms = this.get('ampms');
      let value = ampms[selectedIndex];
      if(value === 'AM' && this.get('ampm') !== 'am'){
        this.set('date', moment(this.get('date')).subtract(12, 'hours').toDate());
      }
      if(value === 'PM' && this.get('ampm') !== 'pm'){
        this.set('date', moment(this.get('date')).add(12, 'hours').toDate());
      }
      this.sendAction('action', this.get('date'));
    },
  }
});
