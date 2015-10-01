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
    setView(view){
      this.set('view', view);
    },
    goForward(){
      let newDate = moment(this.get('selectedDate')).add(1, this.get('selectedView')).format('YYYY-MM-DD');
      this.set('date', newDate);
    },
    goBack(){
      let newDate = moment(this.get('selectedDate')).subtract(1, this.get('selectedView')).format('YYYY-MM-DD');
      this.set('date', newDate);
    },
    gotoToday(){
      let newDate = moment().format('YYYY-MM-DD');
      this.set('date', newDate);
    },
    toggleShowCalendar(){
      this.set('showCalendar', !this.get('showCalendar'));
    }
  }
});
