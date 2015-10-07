import moment from 'moment';
import Ember from 'ember';
import momentFormat from 'ember-moment/computeds/format';

const { computed } = Ember;
const { oneWay } = computed;

export default Ember.Component.extend({
  classNames: ['time-picker'],
  date: null,
  dateBuffer: oneWay('date'),

  hour: computed('dateBuffer', function() {
    const defaultHour = this.get('defaultHour');

    if (defaultHour) {
      return defaultHour;
    } else {
      return momentFormat('dateBuffer', 'h');
    }
  }),

  minute: momentFormat('dateBuffer', 'mm'),
  ampm: momentFormat('dateBuffer', 'a'),
  hours: ['1','2','3','4','5','6','7','8','9','10','11','12'],
  minutes: ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'],
  ampms: ['am', 'pm'],
  actions: {
    changeHour(){
      this.set('defaultHour', null);

      let select = this.$('select')[0];
      let selectedIndex = select.selectedIndex;
      let hours = this.get('hours');
      let hour = hours[selectedIndex];
      if(this.get('ampm') === 'PM'){
        hour += 12;
      }
      let ourDate = moment(this.get('date'));
      let newDate = ourDate.hour(hour).toDate();

      this.set('dateBuffer', newDate);
      this.sendAction('action', newDate);
    },
    changeMinute(){
      let select = this.$('select')[1];
      let selectedIndex = select.selectedIndex;
      let minutes = this.get('minutes');
      let minute = minutes[selectedIndex];
      let newDate = moment(this.get('date')).minute(minute).toDate();
      this.set('dateBuffer', newDate);
      this.sendAction('action', newDate);
    },
    changeAmPm(){
      let select = this.$('select')[2];
      let selectedIndex = select.selectedIndex;
      let ampms = this.get('ampms');
      let value = ampms[selectedIndex];
      let newDate;
      if(value === 'am' && this.get('ampm') !== 'am'){
        newDate = moment(this.get('date')).subtract(12, 'hours').toDate();
      }
      if(value === 'pm' && this.get('ampm') !== 'pm'){
        newDate = moment(this.get('date')).add(12, 'hours').toDate();
      }
      if(newDate){
        this.set('dateBuffer', newDate);
        this.sendAction('action', newDate);
      }
    },
  }
});
