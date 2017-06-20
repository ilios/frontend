import Ember from 'ember';
import layout from '../templates/components/toggle-wide';

const { Component, computed } = Ember;
const { oneWay } = computed;

export default Component.extend({
  layout,
  tagName: 'label',
  classNames: ['toggle-wide'],
  onLabel: null,
  offLabel: null,
  value: false,
  switchValue: oneWay('value'),
  actions: {
    click(){
      this.sendAction();
    }
  },
});
