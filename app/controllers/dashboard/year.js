/* global moment */

import Ember from "ember";

var DashboardYearController = Ember.ArrayController.extend({
    queryParams: ['year'],
    year: moment().format('YYYY'),
    calendarEvents: function(){
        var self = this;
        return this.get('model').filter(function(event){
            return event.get('start') !== undefined &&
                moment(event.get('start')).format('YYYY') === self.get('year');
        });
    }.property('model.@each', 'year')
});

export default DashboardYearController;
