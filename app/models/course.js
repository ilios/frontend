import DS from 'ember-data';

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
});

export default Course;
