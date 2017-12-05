/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import { isEmpty } from '@ember/utils';
import { task } from 'ember-concurrency';

export default Component.extend({
  store: service(),
  linkedSessionsBuffer: null,
  linkableSessionsBuffer: null,
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
    const linkableSessions = this.get('linkableSessions');
    this.get('loadAttr').perform(sequenceBlock, linkableSessions);
  },

  loadAttr: task(function * (sequenceBlock, linkableSessions) {
    let linkedSessionsBuffer = yield sequenceBlock.get('sessions');
    linkedSessionsBuffer = linkedSessionsBuffer.toArray();
    let linkableSessionsBuffer = yield linkableSessions;
    this.setProperties({
      linkedSessionsBuffer,
      linkableSessionsBuffer
    });
  }),

  allSelected: computed('linkedSessionsBuffer.[]', 'linkableSessionBuffer.[]', function(){
    const linkedSessions = this.get('linkedSessionsBuffer');
    const linkableSessions = this.get('linkableSessionsBuffer');
    if (isEmpty(linkedSessions) || isEmpty(linkableSessions) || linkedSessions.length < linkableSessions.length) {
      return false;
    }
    linkableSessions.forEach(linkableSession => {
      if (! linkedSessions.includes(linkableSession)) {
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

  noneSelected: computed('linkedSessionsBuffer.[]', 'linkableSessionsBuffer.[]', function(){
    const linkedSessions = this.get('linkedSessionsBuffer');
    const linkableSessions = this.get('linkableSessionsBuffer');
    if (isEmpty(linkedSessions) || isEmpty(linkableSessions)) {
      return true;
    }

    let isSelected = false;
    linkedSessions.forEach(linkedSession => {
      if (linkableSessions.includes(linkedSession)) {
        isSelected = true;
      }
    });
    return !isSelected;
  }),

  saveChanges: task(function * () {
    let sessions = this.get('linkedSessionsBuffer');
    yield this.sendAction('save', sessions);

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
    toggleSelectAll() {
      const allSelected = this.get('allSelected');
      if (allSelected) {
        this.set('linkedSessionsBuffer', []);
      } else {
        this.set('linkedSessionsBuffer', this.get('linkableSessionsBuffer').toArray());
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
