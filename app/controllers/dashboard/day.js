/* global moment */
import Ember from "ember";

var DashboardDayController = Ember.ArrayController.extend({
    queryParams: ['year','day'],
    year: moment().format('YYYY'),
    day: moment().format('DDD'),
    calendarEvents: function(){
        var self = this;
        return this.get('model').filter(function(event){
            return event.get('start') !== undefined &&
                moment(event.get('start')).format('YYYY') === self.get('year') &&
                moment(event.get('start')).format('DDD') === self.get('day');
        });
    }.property('model.@each', 'year', 'day')
});

export default DashboardDayController;
