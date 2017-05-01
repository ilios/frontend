import Ember from 'ember';
import { task } from 'ember-concurrency';

const { Component, inject } = Ember;
const { service } = inject;

export default Component.extend({

  tagName: 'span',
  classNames: ['session-attributes'],
  userEvents: service(),

  event: null,
  session: null,

  didReceiveAttrs() {
    let event = this.get('event');
    this.get('loadAttr').perform(event);
  },

  loadAttr: task(function * (event) {
    let userEvents = this.get('userEvents');
    let session = yield userEvents.getSessionForEvent(event);
    this.set('session', session);
  })
});
