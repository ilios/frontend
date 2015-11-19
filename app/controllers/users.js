import Ember from 'ember';

const { computed, Controller, inject, isEmpty, PromiseProxyMixin, run } = Ember;
const { service } = inject;
const { debounce } = run;
const { trim } = Ember.$;

const ProxyContent = Ember.Object.extend(PromiseProxyMixin);

function cleanQuery(query) {
  return trim(query).replace(/[\-,?~!@#$%&*+\-'="]/, '');
}

export default Controller.extend({
  init() {
    this._super(...arguments);

    // This needs to be removed after user session re-write
    this.get('currentUser.model').then((user) => {
      user.get('school').then((userSchool) => {
        this.set('school', userSchool.get('id'));
      });
    });
  },

  queryParams: ['page'],
  page: 1,

  currentUser: service(),
  store: service(),

  query: null,
  delay: 500,

  limit: 20,

  prevPages: computed('page', {
    get() {
      const page = this.get('page');
      return page !== 1;
    }
  }).readOnly(),

  morePages: computed('model', {
    get() {
      const users = this.get('model').toArray();
      const limit = this.get('limit');

      return users.length > limit;
    }
  }).readOnly(),

  users: computed('model', {
    get() {
      const users = this.get('model').toArray();

      if (users.length === 21) {
        users.pop();
      }

      return users;
    }
  }).readOnly(),

  searchResults: computed('query', {
    get() {
      const q = this.get('query');
      const limit = this.get('limit');
      const school = this.get('school');

      if (!isEmpty(cleanQuery(q))) {
        return this.get('store').query('user', { school, limit, q }).then((users) => {
          return users;
        });
      }
    }
  }).readOnly(),

  proxyContent: computed('searchResults', function() {
    const searchResults = this.get('searchResults');

    return ProxyContent.create({
      promise: searchResults
    });
  }),

  _updateQuery(value) {
    this.set('query', value);
  },

  actions: {
    getPrevPage() {
      this.set('page', this.get('page') - 1);
    },

    getNextPage() {
      this.set('page', this.get('page') + 1);
    },

    changeValue(value) {
      debounce(this, this._updateQuery, value, this.get('delay'));
    }
  }
});
