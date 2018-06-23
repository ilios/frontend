import Component from '@ember/component';
import { isEmpty } from '@ember/utils';
import { computed } from '@ember/object';
import escapeRegExp from '../utils/escape-reg-exp';

export default Component.extend({
  tagName: 'tbody',

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
});
