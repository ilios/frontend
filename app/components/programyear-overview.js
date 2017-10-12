import Component from '@ember/component';
import { computed } from '@ember/object';
const { filterBy, sort, not } = computed;

export default Component.extend({
  classNames: ['programyear-overview'],
  programYear: null,
  editable: not('programYear.locked'),
  directorsSort: ['lastName', 'firstName'],
  directorsWithFullName: filterBy('programYear.directors', 'fullName'),
  sortedDirectors: sort('directorsWithFullName', 'directorsSort'),
  actions: {
    addDirector(user) {
      let programYear = this.get('programYear');
      programYear.get('directors').then(directors => {
        directors.addObject(user);
        user.get('programYears').addObject(programYear);
        programYear.save();
      });
    },
    removeDirector(user) {
      let programYear = this.get('programYear');
      programYear.get('directors').then(directors => {
        directors.removeObject(user);
        user.get('programYears').removeObject(programYear);
        programYear.save();
      });
    },
  }
});
