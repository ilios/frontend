import Component from '@ember/component';
import { or, notEmpty } from '@ember/object/computed';
import layout from '../templates/components/ilios-calendar-multiday-event';

export default Component.extend({
  layout,
  tagName: ['li'],
  event: null,
  isIlm: notEmpty('event.ilmSession'),
  isOffering: notEmpty('event.offering'),
  clickable: or('isIlm', 'isOffering'),
  isEventSelectable: true,
  actions: {
    selectEvent(){
      if (this.get('clickable')) {
        this.get('selectEvent')();
      }
    }
  }
});
