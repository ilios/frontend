import Ember from 'ember';
import InPlace from 'ilios/mixins/inplace';

const { Component, computed, isEqual, observer } = Ember;
const { oneWay } = computed;

export default Component.extend(InPlace, {
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
