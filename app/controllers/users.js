import Ember from 'ember';
import DS from 'ember-data';

const { computed, Controller, inject, isEmpty, RSVP, run } = Ember;
const { Promise } = RSVP;
const { service } = inject;
const { PromiseArray } = DS;
const { debounce } = run;
const { trim } = Ember.$;

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

  currentUser: service(),
  store: service(),

  query: null,
  delay: 500,

  limit: 20,
  offset: 0,

  prevPages: computed('offset', {
    get() {
      const offset = this.get('offset');

      return offset !== 0;
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

      users.pop();
      return users;
    }
  }).readOnly(),

  searchResults: computed('query', {
    get() {
      const q = this.get('query');
      const limit = this.get('limit');
      const school = this.get('school');

      if (!isEmpty(cleanQuery(q))) {
        return this.get('store').query('user', { school, limit, q }).then((user) => {
          return users;
        });
      }
    }
  }).readOnly(),

  _updateQuery(value) {
    this.set('query', value);
  },

  actions: {
    getPrevPage() {
      const limit = this.get('limit') + 1;
      const school = this.get('school');
      const offset = this.get('offset') - 20;

      return this.get('store').query('user', { school, limit, offset }).then((users) => {
        this.setProperties({ model: users, offset });
      });
    },

    getNextPage() {
      const limit = this.get('limit') + 1;
      const school = this.get('school');
      const offset = this.get('offset') + 20;

      this.get('store').query('user', { school, limit, offset }).then((users) => {
        this.setProperties({ model: users, offset });
      });
    },

    changeValue(value) {
      debounce(this, this._updateQuery, value, this.get('delay'));
    }
  }
});
