import Ember from 'ember';

const { Component, computed, inject } = Ember;
const { service } = inject;

var ProxiedMaterials = Ember.ObjectProxy.extend({
  isActive: false
});

export default Component.extend({
  store: service(),
  i18n: service(),
  classNames: ['learningmaterial-search'],
  currentMaterials: [],
  query: '',
  searchResults: [],
  searchPage: 0,
  searchResultsPerPage: 50,
  hasMoreSearchResults: false,
  targetItemTitle: '',
  searching: false,
  searchReturned: false,

  actions: {
    search: function(query){
      var self = this;
      if (Ember.$.trim(query) === '') {
        self.set('searchReturned', false);
        self.set('searching', false);
        self.set('searchPage', 1);
        self.set('hasMoreSearchResults', false);
        self.set('searchResults', []);
        return;
      }
      this.set('searchReturned', false);
      this.set('searching', true);
      this.set('query', query);
      var currentMaterials = this.get('currentMaterials');
      this.get('store').query('learningMaterial', {
        q: query,
        limit: this.get('searchResultsPerPage') + 1,
        'order_by[title]': 'ASC',
      }).then(function(lms){
        let results = lms.map(function(lm){
          return ProxiedMaterials.create({
            content: lm,
            isActive: ! currentMaterials.contains(lm)
          });
        });
        self.set('searchReturned', true);
        self.set('searching', false);
        self.set('searchPage', 1);
        self.set('hasMoreSearchResults', (results.length > self.get('searchResultsPerPage')));
        if (self.get('hasMoreSearchResults')) {
          results.pop();
        }
        self.set('searchResults', results);
      });
    },
    searchMore: function() {
      var self = this;
      var currentMaterials = this.get('currentMaterials');
      var query = this.get('query');
      this.get('store').query('learningMaterial', {
        q: query,
        limit: this.get('searchResultsPerPage') + 1,
        offset: this.get('searchPage') * this.get('searchResultsPerPage'),
        'order_by[title]': 'ASC',
      }).then(function(lms){
        let results = lms.map(function(lm){
          return ProxiedMaterials.create({
            content: lm,
            isActive: ! currentMaterials.contains(lm)
          });
        });
        self.set('searchPage', self.get('searchPage') + 1);
        self.set('hasMoreSearchResults', (results.length > self.get('searchResultsPerPage')));
        if (self.get('hasMoreSearchResults')) {
          results.pop();
        }
        self.get('searchResults').pushObjects(results);
      });
    },
    clear: function(){
      this.set('searchResults', []);
      this.set('searchReturned', false);
      this.set('searching', false);
      this.set('searchPage', 0);
      this.set('hasMoreSearchResults', false);
      this.set('query', '');
    },

    add(proxy) {
      let lm = proxy.content;
      if (! this.get('currentMaterials').contains(lm)) {
        proxy.set('isActive', false);
        this.sendAction('add', lm);
      }
    }
  }
});
