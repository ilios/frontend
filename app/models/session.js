import DS from 'ember-data';

var Session = DS.Model.extend({
    title: DS.attr('string'),
    course: DS.belongsTo('course', {async: true}),
    offerings: DS.hasMany('offering', {async: true})

});

export default Session;
