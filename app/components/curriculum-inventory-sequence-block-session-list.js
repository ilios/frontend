/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';

export default Component.extend({
  linkedSessions: null,
  linkableSessionsBuffer: null,
  classNames: ['curriculum-inventory-sequence-block-session-list'],
  tagName: 'section',
  sortBy: 'title',

  init() {
    this._super(...arguments);
    this.set('linkedSessions', []);
    this.set('linkableSessionsBuffer', []);
  },

  didReceiveAttrs(){
    this._super(...arguments);
    const sequenceBlock = this.get('sequenceBlock');
    const linkableSessions = this.get('linkableSessions');
    this.get('loadAttr').perform(sequenceBlock, linkableSessions);
  },

  loadAttr: task(function * (sequenceBlock, linkableSessions) {
    const linkedSessions = yield sequenceBlock.get('sessions');
    const linkableSessionsBuffer = yield linkableSessions;
    this.setProperties({
      linkedSessions,
      linkableSessionsBuffer
    });
  }),

  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),

  actions: {
    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    },
  }
});
