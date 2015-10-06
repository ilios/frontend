import moment from 'moment';
import Ember from 'ember';

export default Ember.Controller.extend({
  queryParams: ['date', 'view', 'showCalendar'],
  currentUser: Ember.inject.service(),
  date: null,
  view: 'week',
  showCalendar: false,
  selectedDate: Ember.computed('date', function(){
    if(this.get('date')){
      return moment(this.get('date'), 'YYYY-MM-DD').format();
    }

    return moment().format();
  }),
  selectedView: Ember.computed('view', function(){
    let view = this.get('view');
    let viewOptions = ['month', 'week', 'day'];
    if(viewOptions.indexOf(view) === -1){
      view = 'week';
    }

    return view;
  }),
  actions: {
    changeDate(newDate){
      this.set('date', moment(newDate).format('YYYY-MM-DD'));
    },
    changeView(newView){
      this.set('view', newView);
    },
    selectEvent(event){
      this.transitionToRoute('events', event.slug);
    },
    toggleShowCalendar(){
      this.set('showCalendar', !this.get('showCalendar'));
    }
  }
});
