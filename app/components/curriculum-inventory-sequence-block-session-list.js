import Component from '@ember/component';
import { computed } from '@ember/object';
import { task } from 'ember-concurrency';

export default Component.extend({
  classNames: ['curriculum-inventory-sequence-block-session-list'],
  tagName: 'section',

  excludedSessions: null,
  linkedSessions: null,
  sessions: null,
  sessionsBuffer: null,
  sortBy: 'title',

  sortedAscending: computed('sortBy', function() {
    const sortBy = this.sortBy;
    return sortBy.search(/desc/) === -1;
  }),

  didReceiveAttrs() {
    this._super(...arguments);
    const sequenceBlock = this.sequenceBlock;
    const sessions = this.sessions;
    this.loadAttr.perform(sequenceBlock, sessions);
  },

  actions: {
    sortBy(what) {
      const sortBy = this.sortBy;
      if(sortBy === what){
        what += ':desc';
      }
      this.setSortBy(what);
    },
  },

  loadAttr: task(function* (sequenceBlock, sessions) {
    const linkedSessions = yield sequenceBlock.get('sessions');
    const excludedSessions = yield sequenceBlock.get('excludedSessions');
    this.setProperties({
      linkedSessions,
      excludedSessions,
      sessionsBuffer: sessions
    });
  })
});
