import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    page: 'page',
    query: 'q'
  },

  page: 1,
  query: '',

  actions: {
    setQuery(query) {
      // don't reset the page when returning back to the same query
      if (query !== this.query) {
        this.setProperties({ page: 1, query });
      }
    }
  }
});
