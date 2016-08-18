import Ember from 'ember';
import DS from 'ember-data';
import { task } from 'ember-concurrency';

const { inject, Component, isPresent, computed, RSVP, isEmpty } = Ember;
const { PromiseArray } = DS;
const { service } = inject;

export default Component.extend({
  store: service(),
  linkedSessions: [],
  linkableSessionsBuffer: [],
  classNames: ['curriculum-inventory-sequence-block-session-editor', 'resultslist'],
  tagName: 'section',
  sortBy: 'title',

  didReceiveAttrs(){
    this._super(...arguments);
    const sequenceBlock = this.get('sequenceBlock');
    const linkableSessions = this.get('linkableSessions');
    this.get('loadAttr').perform(sequenceBlock, linkableSessions);
    console.log('gee');
  },

  loadAttr: task(function * (sequenceBlock, linkableSessions) {
    const linkedSessions = yield sequenceBlock.get('sessions');
    const linkableSessionsBuffer = yield linkableSessions;
    this.setProperties({
      linkedSessions,
      linkableSessionsBuffer
    });
  }),

  saveChanges: task(function * () {
    "use strict";

  }),

  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),

  actions: {
    changeSession(session) {
      let sessions = this.get('linkedSessions');
      if (sessions.contains(session)) {
        sessions.removeObject(session);
      } else {
        sessions.addObject(session);
      }
    },
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.set('sortBy', what);
    },
    close() {
      this.sendAction('cancel')
    }
  }
});
