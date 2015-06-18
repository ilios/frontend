import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  event: null,
  classNameBindings: [':ilios-event', 'event.eventClass'],
  isOffering: Ember.computed.notEmpty('event.offering'),
  offering: Ember.computed('event.offering', function(){
    let offeringId = this.get('event.offering');
    if(!offeringId){
      return null;
    }
    return DS.PromiseObject.create({
      promise: this.get('store').find('offering', offeringId)
    });
  })
});
