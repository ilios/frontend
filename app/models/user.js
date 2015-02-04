import Ember from 'ember';
import DS from 'ember-data';

var User = DS.Model.extend({
  firstName: DS.attr('string'),
  lastName: DS.attr('string'),
  middleName: DS.attr('string'),
  phone: DS.attr('string'),
  email:  DS.attr('string'),
  enabled:  DS.attr('boolean'),
  ucUid:  DS.attr('string'),
  otherId:  DS.attr('string'),
  offerings: DS.hasMany('offering', {async: true}),
  schools: DS.hasMany('school', {async: true}),
  primarySchool: DS.belongsTo('school', {async: true}),
  directedCourses: DS.hasMany('course', {async: true}),
  fullName: function() {
      return this.get('firstName') + ' ' + this.get('lastName');
  }.property('firstName', 'lastName'),
  events: function(){
      var promises = {
        offerings: this.get('offerings')
      };
      return new Ember.RSVP.hash(promises).then(function(results) {
        var events = [];
        results.offerings.forEach(function(offering){
            events.push(offering);
        });

        var eventPromises = [];
        events.forEach(function(event){
           eventPromises.push(event.get('start'));
           eventPromises.push(event.get('end'));
           eventPromises.push(event.get('title'));
        });
        return new Ember.RSVP.all(eventPromises).then(function(){
            return events;
        });
      });
  }.property('offerings.@each', 'offerings.@each.session')
});

export default User;
