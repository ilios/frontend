import DS from 'ember-data';

var Course = DS.Model.extend({
    title: DS.attr('string'),
    starDate: DS.attr('date'),
    endDate: DS.attr('date'),
    sessions: DS.hasMany('session', {async: true})
});

export default Course;
