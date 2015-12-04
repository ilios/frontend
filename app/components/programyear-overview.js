import Ember from 'ember';

const { Component, computed } = Ember;
const { filterBy, sort } = computed;

export default Component.extend({
  classNames: ['programyear-overview'],
  programYear: null,
  directorsSort: ['lastName', 'firstName'],
  directorsWithFullName: filterBy('programYear.directors', 'fullName'),
  sortedDirectors: sort('directorsWithFullName', 'directorsSort'),
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
