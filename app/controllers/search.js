import Controller from '@ember/controller';

export default Controller.extend({
  queryParams: {
    page: 'page',
    query: 'q'
  },

  page: 1,
  query: ''
});
