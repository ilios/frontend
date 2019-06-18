import Component from '@ember/component';
import { computed } from '@ember/object';
import { equal } from '@ember/object/computed';

export default Component.extend({
  classNames: ['pagination-links'],

  page: null,
  results: null,
  size: null,
  onSelectPage() {},

  disablePrev: equal('page', 1),

  disableNext: computed('lastPage', 'page', function() {
    return this.lastPage === this.page;
  }),

  lastPage: computed('results', 'size', function() {
    return Math.ceil(this.results.length / this.size);
  }),

  pages: computed('lastPage', 'page', 'totalPages', function() {
    const { lastPage, page } = this.getProperties('lastPage', 'page');
    return lastPage <= 7
      ? this.simplePages(lastPage)
      : this.complexPages(lastPage, page);
  }),

  actions: {
    selectPage(value) {
      this.onSelectPage(this.page + value);
    }
  },

  simplePages(lastPage) {
    const pageNumbers = [];

    for (let i = 1; i <= lastPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  },

  complexPages(lastPage, page) {
    if (page <= 4) {
      return [1, 2, 3, 4, 5, '...', lastPage];
    }

    if (page >= (lastPage - 3)) {
      return [1, '...', lastPage - 4, lastPage - 3, lastPage - 2, lastPage - 1, lastPage];
    }

    return [1, '...', page - 1, page, page + 1, page + 2, '...', lastPage];
  }
});
