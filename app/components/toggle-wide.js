import Ember from 'ember';
import randomString from '../utils/random-string';

export default Ember.Component.extend({
  tagName: 'label',
  classNames: ['switch', 'switch-wide', 'switch-green'],
  onLabel: null,
  cssId: randomString(),
  offLabel: null,
  value: false,
  switchValue: Ember.computed.oneWay('value'),
  actions: {
    click(){
      this.sendAction();
    }
  }
});
