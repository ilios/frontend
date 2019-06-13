import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: ['page', { query: 'q' }],

  page: 1,
  query: '',

  actions: {
    prevPage() {
      this.set('page', this.page - 1);
    },

    nextPage() {
      this.set('page', this.page + 1);
    }
  }
});
