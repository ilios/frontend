import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['programyear-overview'],
  programYear: null,
  directorsSort: ['lastName', 'firstName'],
  directorsWithFullName: Ember.computed.filterBy('programYear.directors', 'fullName'),
  sortedDirectors: Ember.computed.sort('directorsWithFullName', 'directorsSort'),
  actions: {
    addDirector: function(user){
      var programYear = this.get('programYear');
      programYear.get('directors').addObject(user);
      user.get('directedProgramYears').addObject(programYear);
      programYear.save();
      user.save();
    },
    removeDirector: function(user){
      var programYear = this.get('programYear');
      programYear.get('directors').removeObject(user);
      user.get('directedProgramYears').removeObject(programYear);
      programYear.save();
      user.save();
    },
  }
});
