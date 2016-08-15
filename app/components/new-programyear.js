import Ember from 'ember';

const { Component, isEmpty } = Ember;

export default Component.extend({
  classNames: ['new-programyear'],

  selectedYear: null,
  availableAcademicYears: null,

  actions: {
    setYear(year) {
      this.set('selectedYear', year);
    },
    save() {
      this.set('isSaving', true);
      let startYear = this.get('selectedYear');
      if (isEmpty(startYear)) {
        const availableAcademicYears = this.get('availableAcademicYears');
        startYear = availableAcademicYears.get('firstObject.value');
      }

      if (isEmpty(startYear)) {
        return false;
      }

      this.get('save')(parseInt(startYear)).finally(() =>{
        this.set('isSaving', false);
      });
    },
  }
});
