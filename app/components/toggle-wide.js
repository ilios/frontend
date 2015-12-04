import Ember from 'ember';
import randomString from '../utils/random-string';

const { Component, computed } = Ember;
const { oneWay } = computed;

export default Component.extend({
  tagName: 'label',
  classNames: ['switch', 'switch-wide', 'switch-green'],
  cssId: computed(function() {
    return randomString();
  }),
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
