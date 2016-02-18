import Ember from 'ember';
import DS from 'ember-data';

const { PromiseArray } = DS;

const { Component, inject, RSVP, computed } = Ember;
const { service } = inject;

export default Component.extend({
  store: service(),
  tagName: 'section',
  classNames: ['pending-updates-summary', 'summary-block'],

  updates: computed(function(){
    return this.get('store').query('pending-user-update', {
      limit: 1000
    });
  })
});
