import Ember from 'ember';
import layout from '../templates/components/ilios-calendar-multiday-event';

const { notEmpty, or } = Ember.computed;

export default Ember.Component.extend({
  layout,
  tagName: ['li'],
  event: null,
  isIlm: notEmpty('event.ilmSession'),
  isOffering: notEmpty('event.offering'),
  clickable: or('isIlm', 'isOffering'),
  actions: {
    selectEvent(){
      if (this.get('clickable')) {
        this.get('selectEvent')();
      }
    }
  }
});
