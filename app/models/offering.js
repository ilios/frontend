import DS from 'ember-data';
var Offering = DS.Model.extend({
    startDate: DS.attr('date'),
    endDate: DS.attr('date'),
    deleted: DS.attr('boolean'),
    room: DS.attr('string'),
    lastUpdatedOn: DS.attr('date'),
    session: DS.belongsTo('session', {async: true}),
    users: DS.hasMany('user', {async: true}),
    learnerGroups: DS.hasMany('learner-group', {async: true}),
    instructorGroups: DS.hasMany('instructor-group', {async: true}),
    publishEvent: DS.belongsTo('publish-event', {async: true}),
    recurringEvents: DS.hasMany('recurring-event', {async: true}),
    title: function(){
        return this.get('session.title');
    }.property('session.title')
});

export default Offering;
