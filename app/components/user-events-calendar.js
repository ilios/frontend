import Ember from 'ember';

export default Ember.Component.extend({
  view: null,
  userEvents: [],
  isMonthView: Ember.computed.equal('view', 'month'),
  isWeekView: Ember.computed.equal('view', 'week'),
  isDayView: Ember.computed.equal('view', 'day'),
  classNameBindings: ['calendarType'],
  calendarType: Ember.computed('view', function(){
    return this.get('view') + '-calendar';
  }),
  elementTops: [],
  watchElements: function(){
    var self = this;
    Ember.run.next(function(){
      let tops = [];
      $('.event').each(function(){
          tops.push($(this).offset().top);
      });
      self.set('elementTops', tops);
    });
  }.observes('view', 'userEvents.[]').on('didInsertElement'),
  lowestTop: Ember.computed.min('elementTops'),
  scrollCalendar: function(){
    let lowestTop = this.get('lowestTop');
    let calendar = $('.el-calendar');
    if(lowestTop && calendar.length){
      let calendarTop = calendar.offset().top + 50;
      let position = lowestTop - calendarTop;
      $(".day-calendar .el-calendar .week").scrollTop(position);
      $(".week-calendar .el-calendar .week").scrollTop(position);
    }
  }.observes('lowestTop').on('didInsertElement'),
});
