/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';

export default Component.extend({
  store: service(),
  linkedSessionsBuffer: null,
  excludedSessionsBuffer: null,
  sessionsBuffer: null,
  classNames: ['curriculum-inventory-sequence-block-session-manager', 'resultslist'],
  tagName: 'section',
  sortBy: 'title',

  init() {
    this._super(...arguments);
    this.set('linkedSessionsBuffer', []);
    this.set('linkableSessionsBuffer', []);
  },

  didReceiveAttrs(){
    this._super(...arguments);
    const sequenceBlock = this.get('sequenceBlock');
    const sessions = this.get('sessions');
    this.get('loadAttr').perform(sequenceBlock, sessions);
  },

  loadAttr: task(function * (sequenceBlock, sessions) {
    let linkedSessionsBuffer = yield sequenceBlock.get('sessions');
    linkedSessionsBuffer = linkedSessionsBuffer.toArray();
    let excludedSessionsBuffer = yield sequenceBlock.get('excludedSessions');
    excludedSessionsBuffer = excludedSessionsBuffer.toArray();
    let sessionsBuffer = yield sessions;
    this.setProperties({
      linkedSessionsBuffer,
      excludedSessionsBuffer,
      sessionsBuffer,
    });
  }),

  allSelected: computed('linkedSessionsBuffer.[]', 'sessionsBuffer.[]', function(){
    const linkedSessions = this.get('linkedSessionsBuffer');
    const sessions = this.get('sessionsBuffer');
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

  allExcluded: computed('excludedSessionsBuffer.[]', 'sessionsBuffer.[]', function(){
    const excludedSessions = this.get('excludedSessionsBuffer');
    const sessions = this.get('sessionsBuffer');
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

  someSelected: computed('allSelected', 'noneSelected', function(){
    const allSelected = this.get('allSelected');
    const noneSelected = this.get('noneSelected');
    return (!allSelected && !noneSelected);
  }),

  someExcluded: computed('allExcluded', 'noneExcluded', function(){
    const allExcluded = this.get('allExcluded');
    const noneExcluded = this.get('noneExcluded');
    return (!allExcluded && !noneExcluded);
  }),

  noneSelected: computed('linkedSessionsBuffer.[]', 'sessionsBuffer.[]', function(){
    const linkedSessions = this.get('linkedSessionsBuffer');
    const sessions = this.get('sessionsBuffer');

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

  noneExcluded: computed('excludedSessionsBuffer.[]', 'sessionsBuffer.[]', function(){
    const excludedSessions = this.get('excludedSessionsBuffer');
    const sessions = this.get('sessionsBuffer');

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

  saveChanges: task(function * () {
    let sessions = this.get('linkedSessionsBuffer');
    let excludedSessions = this.get('excludedSessionsBuffer');
    yield this.sendAction('save', sessions, excludedSessions);

  }),

  sortedAscending: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    return sortBy.search(/desc/) === -1;
  }),

  actions: {
    changeSession(session) {
      let sessions = this.get('linkedSessionsBuffer');
      if (sessions.includes(session)) {
        sessions.removeObject(session);
      } else {
        sessions.addObject(session);
      }
    },

    excludeSession(session) {
      let sessions = this.get('excludedSessionsBuffer');
      if (sessions.includes(session)) {
        sessions.removeObject(session);
      } else {
        sessions.addObject(session);
      }
    },

    toggleSelectAll() {
      const allSelected = this.get('allSelected');

      if (allSelected) { // un-select all sessions
        this.set('linkedSessionsBuffer', []);
      } else { //select all sessions
        this.set('linkedSessionsBuffer', this.get('sessionsBuffer'));
      }
    },

    toggleExcludeAll() {
      const allSelected = this.get('allExcluded');

      if (allSelected) { // un-select all sessions
        this.set('excludedSessionsBuffer', []);
      } else { //select all sessions
        this.set('excludedSessionsBuffer', this.get('sessionsBuffer'));
      }
    },

    sortBy(what){
      const sortBy = this.get('sortBy');
      if(sortBy === what){
        what += ':desc';
      }
      this.get('setSortBy')(what);
    },
    close() {
      this.sendAction('cancel');
    }
  }
});
