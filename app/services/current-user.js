import Ember from 'ember';

export default Ember.ObjectProxy.extend({
  currentUser: Ember.computed.alias('content'),
  currentUserBuffer: null,
  currentSchool: function(key, value /**, previousValue**/) {
    if (arguments.length > 1) {
      this.set('currentUserBuffer', value);
    }
    var self = this;
    //always return a promise even if the school has been set manaully (by the school-picker for isntance)
    return new Ember.RSVP.Promise(function(resolve) {
      var buffer = self.get('currentUserBuffer');
      if(buffer != null){
        resolve(buffer);
      }

      resolve(self.get('primarySchool'));
    });
  }.property('currentUser'),
  canChangeSchool: function(){
    return this.get('schools.length') > 1;
  }.property('schools.@each'),
  //will be customizable
  preferredDashboard: 'dashboard.week'
});
