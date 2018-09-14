import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import escapeRegExp from '../utils/escape-reg-exp';
import { task } from 'ember-concurrency';
import layout from '../templates/components/sessions-grid';

export default Component.extend({
  layout,
  classNames: ['sessions-grid'],
  'data-test-sessions-grid': true,
  confirmDeleteSessionIds: null,

  filteredSessions: computed('sessions.[]', 'filterBy', function(){
    const sessions = this.get('sessions');
    const filterBy = this.get('filterBy');
    if (isEmpty(sessions)) {
      return [];
    }
    if (isEmpty(filterBy)) {
      return sessions;
    }

    let filterExpressions = filterBy.split(' ').map(function (string) {
      const clean = escapeRegExp(string);
      return new RegExp(clean, 'gi');
    });

    return sessions.filter(session => {
      let matchedSearchTerms = 0;

      for (let i = 0; i < filterExpressions.length; i++) {
        if (session.searchString.match(filterExpressions[i])) {
          matchedSearchTerms++;
        }
      }
      //if the number of matching search terms is equal to the number searched, return true
      return (matchedSearchTerms === filterExpressions.length);
    });
  }),

  sortedSessions: computed('filteredSessions.[]', 'sortInfo', function(){
    const sessions = this.get('filteredSessions');
    const sortInfo = this.get('sortInfo');

    if (sortInfo.descending) {
      return sessions.sortBy(sortInfo.column).reverse();
    }

    return sessions.sortBy(sortInfo.column);
  }),

  sortInfo: computed('sortBy', function(){
    const sortBy = this.get('sortBy');
    const parts = sortBy.split(':');
    const column = parts[0];
    const descending = parts.length > 1 && parts[1] === 'desc';

    return { column, descending, sortBy };
  }),

  init() {
    this._super(...arguments);
    this.set('confirmDeleteSessionIds', []);
  },

  actions: {
    confirmDelete(sessionId) {
      this.confirmDeleteSessionIds.pushObject(sessionId);
    },
    cancelDelete(sessionId) {
      this.confirmDeleteSessionIds.removeObject(sessionId);
    },
    expandSession(sessionObject) {
      if (sessionObject.offeringCount) {
        this.expandSession(sessionObject.session);
      }
    }
  },

  removeSession: task(function * (session){
    session.deleteRecord();
    yield session.save();
  }).drop(),
});
