import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, isEmpty } = Ember;

export default Component.extend({
  classNames: ['new-programyear'],

  selectedYear: null,
  availableAcademicYears: null,

  saveNewYear: task(function * (){
    let startYear = this.get('selectedYear');
    if (isEmpty(startYear)) {
      const availableAcademicYears = this.get('availableAcademicYears');
      startYear = availableAcademicYears.get('firstObject.value');
    }
    if (isEmpty(startYear)) {
      return false;
    }
    yield this.get('save')(parseInt(startYear));
  }).drop(),
});
