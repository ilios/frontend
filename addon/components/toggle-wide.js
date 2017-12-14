import Component from '@ember/component';
import layout from '../templates/components/toggle-wide';
import { oneWay } from '@ember/object/computed';

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
