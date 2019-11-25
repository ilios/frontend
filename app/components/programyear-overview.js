import Component from '@ember/component';
import { filterBy, sort } from '@ember/object/computed';
import config from '../config/environment';

const { IliosFeatures: { programYearVisualizations } } = config;

export default Component.extend({
  classNames: ['programyear-overview'],

  canUpdate: false,
  directorsSort: null,
  programYear: null,
  programYearVisualizations,

  directorsWithFullName: filterBy('programYear.directors', 'fullName'),
  sortedDirectors: sort('directorsWithFullName', 'directorsSort'),

  init() {
    this._super(...arguments);
    this.set('directorsSort', ['lastName', 'firstName']);
  },

  actions: {
    addDirector(user) {
      const programYear = this.programYear;
      programYear.get('directors').then(directors => {
        directors.addObject(user);
        user.get('programYears').addObject(programYear);
        programYear.save();
      });
    },

    removeDirector(user) {
      const programYear = this.programYear;
      programYear.get('directors').then(directors => {
        directors.removeObject(user);
        user.get('programYears').removeObject(programYear);
        programYear.save();
      });
    }
  }
});
