import Ember from 'ember';
import randomString from '../utils/random-string';

export default Ember.Component.extend({
  tagName: 'label',
  classNames: ['switch', 'switch-wide', 'switch-green'],
  cssId: Ember.computed(function() {
    return randomString();
  }),
  onLabel: null,
  offLabel: null,
  value: false,
  switchValue: Ember.computed.oneWay('value'),
  actions: {
    click(){
      this.sendAction();
    }
  },
});
