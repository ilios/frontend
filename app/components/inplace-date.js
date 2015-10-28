import Ember from 'ember';
import InPlaceValidation from 'ilios/mixins/inplace-validation';

const { Component, computed, isEqual, observer } = Ember;
const { oneWay } = computed;

export default Component.extend(InPlaceValidation, {
  classNames: ['editinplace', 'inplace-select'],

  dateFormat: 'MM/DD/YY',

  // Little hacky cuz pikaday doesn't send actions
  dateBuffer: oneWay('buffer'),

  dateBufferChanged: observer('dateBuffer', function() {
    const dateBuffer = this.get('dateBuffer');
    const buffer = this.get('buffer');

    if (!isEqual(dateBuffer, buffer)) {
      this.send('changeValue', dateBuffer);
    }
  })
});
