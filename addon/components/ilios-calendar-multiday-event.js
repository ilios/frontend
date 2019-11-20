import Component from '@ember/component';
import { or, notEmpty } from '@ember/object/computed';

export default Component.extend({
  tagName: 'li',
  event: null,
  isEventSelectable: true,
  isIlm: notEmpty('event.ilmSession'),
  isOffering: notEmpty('event.offering'),
  clickable: or('isIlm', 'isOffering'),
  actions: {
    selectEvent(selectedEvent) {
      const clickable = this.get('clickable');
      const isEventSelectable = this.get('isEventSelectable');
      const selectEvent = this.get('selectEvent');
      if (clickable && isEventSelectable) {
        selectEvent(selectedEvent);
      }
    }
  }
});
