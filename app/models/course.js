import DS from 'ember-data';
import Ember from 'ember';

var Course = DS.Model.extend({
    title: DS.attr('string'),
    startDate: DS.attr('date'),
    endDate: DS.attr('date'),
    level: DS.attr('number'),
    year: DS.attr('number'),
    externalId: DS.attr('string'),
    deleted: DS.attr('boolean'),
    locked: DS.attr('boolean'),
    archived: DS.attr('boolean'),
    publishedAsTBD: DS.attr('boolean'),
    sessions: DS.hasMany('session', {async: true}),
    owningSchool: DS.belongsTo('school', {async: true}),
    cohorts: DS.hasMany('cohort', {async: true}),
    directors: DS.hasMany('users', {async: true}),
    objectives: DS.hasMany('objective', {async: true}),
    relatedUsers: function(){
      return Ember.A();
    }.property(),
    academicYear: function(){
      return this.get('year') + ' - ' + (parseInt(this.get('year')) + 1);
    }.property('year')
});

export default Course;
