import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'label',
  classNames: ['switch', 'switch-wide', 'switch-green'],
  onLabel: null,
  offLabel: null,
  value: false,
  switchValue: Ember.computed.oneWay('value'),
  actions: {
    click(){
      this.sendAction();
    }
  }
});
