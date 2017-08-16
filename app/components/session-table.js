import Ember from 'ember';
import Table from 'ember-light-table';

const { Component, computed, isEmpty } = Ember;

export default Component.extend({
  classNames: ['session-table'],
  init(){
    this._super(...arguments);
    this.set('sessions', []);
  },
  sortBy: null,
  filterBy: null,
  sessions: null,

  table: computed('sortedSessions.[]', 'columns.[]', function(){
    const columns = this.get('columns');
    const sortedSessions = this.get('sortedSessions');
    const table = new Table(columns, sortedSessions);

    return table;
  }),

  columns: computed('sortInfo', function(){
    const sortInfo = this.get('sortInfo');
    const title = {
      type: 'translatable-table-column',
      cellComponent: 'session-table-title',
      labelKey: 'general.title',
      valuePath: 'title',
      sortable: true,
      width: '300px',
      breakpoints: ['smallScreen', 'mediumScreen', 'largeScreen', 'giantScreen'],
    };
    const type = {
      type: 'translatable-table-column',
      labelKey: 'general.type',
      valuePath: 'sessionTypeTitle',
      sortable: true,
      breakpoints: ['giantScreen'],
    };
    const groups = {
      type: 'translatable-table-column',
      labelKey: 'general.groups',
      valuePath: 'learnerGroupCount',
      sortable: true,
      width: '75px',
      breakpoints: ['largeScreen', 'giantScreen'],
    };
    const firstOffering = {
      type: 'translatable-table-column',
      cellComponent: 'session-table-first-offering',
      labelKey: 'general.firstOffering',
      valuePath: 'firstOfferingDate',
      sortable: true,
      breakpoints: ['largeScreen', 'giantScreen'],
    };
    const offerings = {
      type: 'translatable-table-column',
      labelKey: 'general.offerings',
      valuePath: 'offeringCount',
      sortable: true,
      width: '100px',
      breakpoints: ['mediumScreen', 'largeScreen', 'giantScreen'],
    };
    const status = {
      type: 'translatable-table-column',
      cellComponent: 'session-table-status',
      labelKey: 'general.status',
      valuePath: 'status',
      sortable: true,
      width: '65px',
      breakpoints: ['mediumScreen', 'largeScreen', 'giantScreen'],
    };

    let columns =  [title, type, groups, firstOffering, offerings, status];

    let sortColumn = columns.findBy('valuePath', sortInfo.column);
    sortColumn.sorted = true;
    sortColumn.ascending = !sortInfo.descending;

    return columns;
  }),
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
      return new RegExp(string, 'gi');
    });
    let filtered = sessions.filter(session => {
      let matchedSearchTerms = 0;

      for (let i = 0; i < filterExpressions.length; i++) {
        if (session.searchString.match(filterExpressions[i])) {
          matchedSearchTerms++;
        }
      }
      //if the number of matching search terms is equal to the number searched, return true
      return (matchedSearchTerms === filterExpressions.length);
    });

    return filtered;
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

  actions: {
    columnClicked(column){
      const what = column.get('valuePath');
      const direction = column.ascending ? '' : ':desc';
      this.get('setSortBy')(`${what}${direction}`);
    },
  }
});
