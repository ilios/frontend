/* global moment */
import Ember from "ember";

var DashboardMonthController = Ember.ArrayController.extend({
    queryParams: ['year','month'],
    year: moment().format('YYYY'),
    month: moment().format('M'),
    currentUser: null,
    calendarEvents: function(){
        var self = this;
        return this.get('model').filter(function(event){
            return event.get('start') !== undefined &&
                moment(event.get('start')).format('YYYY') === self.get('year') &&
                moment(event.get('start')).format('M') === self.get('month');
        });
    }.property('model.@each', 'year', 'month')
});

export default DashboardMonthController;
