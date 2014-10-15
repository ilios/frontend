import DS from 'ember-data';

var Offering = DS.Model.extend({
    start: DS.attr('date'),
    end: DS.attr('date'),
    session: DS.belongsTo('session', {async: true}),
    users: DS.hasMany('user', {async: true}),
    instructorGroups: DS.hasMany('instructor-group', {async: true}),
    title: function(){
        return this.get('session.title');
    }.property('session.title')
});

export default Offering;
