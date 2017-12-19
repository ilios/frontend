import Component from '@ember/component';
import layout from '../templates/components/ilios-calendar-month';

export default Component.extend({
  layout,
  classNames: ['ilios-calendar-month'],
  date: null,
  calendarEvents: null,
  showMore: null,
  init() {
    this._super(...arguments);
    this.set('calendarEvents', []);
  },
  actions: {
    changeToDayView(date){
      this.get('changeDate')(date);
      this.get('changeView')('day');
    },
  }
});
