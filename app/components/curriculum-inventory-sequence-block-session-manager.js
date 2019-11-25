import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';

export default Component.extend({
  store: service(),

  classNames: ['curriculum-inventory-sequence-block-session-manager', 'resultslist'],
  tagName: 'section',

  excludedSessionsBuffer: null,
  linkedSessionsBuffer: null,
  sessionsBuffer: null,
  sortBy: 'title',

  allSelected: computed('linkedSessionsBuffer.[]', 'sessionsBuffer.[]', function() {
    const linkedSessions = this.linkedSessionsBuffer;
    const sessions = this.sessionsBuffer;
    if (isEmpty(linkedSessions) || isEmpty(sessions) || linkedSessions.length < sessions.length) {
      return false;
    }
    sessions.forEach(session => {
      if (! linkedSessions.includes(session)) {
        return false;
      }
    });
    return true;
  }),

  allExcluded: computed('excludedSessionsBuffer.[]', 'sessionsBuffer.[]', function() {
    const excludedSessions = this.excludedSessionsBuffer;
    const sessions = this.sessionsBuffer;
    if (isEmpty(excludedSessions) || isEmpty(sessions) || excludedSessions.length < sessions.length) {
      return false;
    }
    sessions.forEach(session => {
      if (! excludedSessions.includes(session)) {
        return false;
      }
    });
    return true;
  }),

  someSelected: computed('allSelected', 'noneSelected', function() {
    const allSelected = this.allSelected;
    const noneSelected = this.noneSelected;
    return (!allSelected && !noneSelected);
  }),

  someExcluded: computed('allExcluded', 'noneExcluded', function() {
    const allExcluded = this.allExcluded;
    const noneExcluded = this.noneExcluded;
    return (!allExcluded && !noneExcluded);
  }),

  noneSelected: computed('linkedSessionsBuffer.[]', 'sessionsBuffer.[]', function() {
    const linkedSessions = this.linkedSessionsBuffer;
    const sessions = this.sessionsBuffer;

    if (isEmpty(linkedSessions) || isEmpty(sessions)) {
      return true;
    }

    let isSelected = false;
    linkedSessions.forEach(linkedSession => {
      if (sessions.includes(linkedSession)) {
        isSelected = true;
      }
    });
    return !isSelected;
  }),

  noneExcluded: computed('excludedSessionsBuffer.[]', 'sessionsBuffer.[]', function() {
    const excludedSessions = this.excludedSessionsBuffer;
    const sessions = this.sessionsBuffer;

    if (isEmpty(excludedSessions) || isEmpty(sessions)) {
      return true;
    }

    let isSelected = false;
    excludedSessions.forEach(session => {
      if (sessions.includes(session)) {
        isSelected = true;
      }
    });
    return !isSelected;
  }),

  sortedAscending: computed('sortBy', function() {
    const sortBy = this.sortBy;
    return sortBy.search(/desc/) === -1;
  }),

  init() {
    this._super(...arguments);
    this.set('linkedSessionsBuffer', []);
    this.set('linkableSessionsBuffer', []);
  },

  didReceiveAttrs() {
    this._super(...arguments);
    const sequenceBlock = this.sequenceBlock;
    const sessions = this.sessions;
    this.loadAttr.perform(sequenceBlock, sessions);
  },

  actions: {
    changeSession(session) {
      const sessions = this.linkedSessionsBuffer;
      if (sessions.includes(session)) {
        sessions.removeObject(session);
      } else {
        sessions.addObject(session);
      }
    },

    excludeSession(session) {
      const sessions = this.excludedSessionsBuffer;
      if (sessions.includes(session)) {
        sessions.removeObject(session);
      } else {
        sessions.addObject(session);
      }
    },

    toggleSelectAll() {
      const allSelected = this.allSelected;

      if (allSelected) { // un-select all sessions
        this.set('linkedSessionsBuffer', []);
      } else { //select all sessions
        this.set('linkedSessionsBuffer', this.sessionsBuffer.toArray());
      }
    },

    toggleExcludeAll() {
      const allSelected = this.allExcluded;

      if (allSelected) { // un-select all sessions
        this.set('excludedSessionsBuffer', []);
      } else { //select all sessions
        this.set('excludedSessionsBuffer', this.sessionsBuffer.toArray());
      }
    },

    sortBy(what) {
      const sortBy = this.sortBy;
      if(sortBy === what){
        what += ':desc';
      }
      this.setSortBy(what);
    },

    close() {
      this.cancel();
    }
  },

  loadAttr: task(function* (sequenceBlock, sessions) {
    let linkedSessionsBuffer = yield sequenceBlock.get('sessions');
    linkedSessionsBuffer = linkedSessionsBuffer.toArray();
    let excludedSessionsBuffer = yield sequenceBlock.get('excludedSessions');
    excludedSessionsBuffer = excludedSessionsBuffer.toArray();
    const sessionsBuffer = yield sessions;
    this.setProperties({
      linkedSessionsBuffer,
      excludedSessionsBuffer,
      sessionsBuffer,
    });
  }),

  saveChanges: task(function* () {
    const sessions = this.linkedSessionsBuffer;
    const excludedSessions = this.excludedSessionsBuffer;
    yield this.save(sessions, excludedSessions);
  })
});
