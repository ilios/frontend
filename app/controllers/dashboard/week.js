/* global moment */
import Ember from "ember";

var DashboardWeekController = Ember.ArrayController.extend({
    queryParams: ['year','week'],
    year: moment().format('YYYY'),
    week: moment().format('W'),
    calendarEvents: function(){
        var self = this;
        return this.get('model').filter(function(event){
            return event.get('start') !== undefined &&
                moment(event.get('start')).format('YYYY') === self.get('year') &&
                moment(event.get('start')).format('W') === self.get('week');
        });
    }.property('model.@each', 'year', 'week')
});

export default DashboardWeekController;
