import Ember from 'ember';
import InPlace from 'ilios/mixins/inplace';

const { Component, isEqual } = Ember;

export default Component.extend(InPlace, {
  classNames: ['editinplace', 'inplace-select'],

  dateFormat: 'MM/DD/YY',

  actions: {
    selectDate(selectedDate) {
      const buffer = this.get('buffer');
      if (!isEqual(buffer, selectedDate)) {
        this.send('changeValue', selectedDate);
      }
    }
  }
});
