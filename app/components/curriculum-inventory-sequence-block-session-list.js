/* eslint ember/order-in-components: 0 */
import Component from '@ember/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';

export default Component.extend({
  sessions: null,
  linkedSessions: null,
  excludedSessions: null,
  sessionsBuffer: null,
  classNames: ['curriculum-inventory-sequence-block-session-list'],
  tagName: 'section',
  sortBy: 'title',

  didReceiveAttrs(){
    this._super(...arguments);
    const sequenceBlock = this.sequenceBlock;
    const sessions = this.sessions;
    this.loadAttr.perform(sequenceBlock, sessions);
  },

  loadAttr: task(function * (sequenceBlock, sessions) {
    const linkedSessions = yield sequenceBlock.get('sessions');
    const excludedSessions = yield sequenceBlock.get('excludedSessions');
    this.setProperties({
      linkedSessions,
      excludedSessions,
      sessionsBuffer: sessions
    });
  }),

  sortedAscending: computed('sortBy', function(){
    const sortBy = this.sortBy;
    return sortBy.search(/desc/) === -1;
  }),

  actions: {
    sortBy(what){
      const sortBy = this.sortBy;
      if(sortBy === what){
        what += ':desc';
      }
      this.setSortBy(what);
    },
  }
});
