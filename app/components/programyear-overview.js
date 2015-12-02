import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['programyear-overview'],
  programYear: null,
  directorsSort: ['lastName', 'firstName'],
  directorsWithFullName: Ember.computed.filterBy('programYear.directors', 'fullName'),
  sortedDirectors: Ember.computed.sort('directorsWithFullName', 'directorsSort'),
  actions: {
    addDirector: function(user){
      let programYear = this.get('programYear');
      programYear.get('directors').then(directors => {
        directors.addObject(user);
        user.get('programYears').addObject(programYear);
        programYear.save();
      });
    },
    removeDirector: function(user){
      let programYear = this.get('programYear');
      programYear.get('directors').then(directors => {
        directors.removeObject(user);
        user.get('programYears').removeObject(programYear);
        programYear.save();
      });
    },
  }
});
