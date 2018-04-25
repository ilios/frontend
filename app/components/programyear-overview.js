/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
const { filterBy, sort } = computed;

export default Component.extend({
  init(){
    this._super(...arguments);
    this.set('directorsSort', ['lastName', 'firstName']);
  },
  classNames: ['programyear-overview'],
  programYear: null,
  canUpdate: false,
  directorsSort: null,
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
