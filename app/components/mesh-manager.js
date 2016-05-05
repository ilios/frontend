import Ember from 'ember';
import layout from '../templates/components/mesh-manager';

const { Component, computed } = Ember;

var ProxiedDescriptors = Ember.ObjectProxy.extend({
  terms: [],
  isActive: computed('content', 'terms.[]', function(){
    return !this.get('terms').contains(this.get('content'));
  })
});

export default Component.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  layout: layout,
  classNames: ['detail-block', 'mesh-manager'],
  terms: [],
  query: '',
  searchResults: [],
  searchPage: 0,
  searchResultsPerPage: 50,
  hasMoreSearchResults: false,
  targetItemTitle: '',
  searching: false,
  searchReturned: false,
  sortTerms: ['name'],
  sortedTerms: computed('terms.@each.name', function(){
    var terms = this.get('terms');
    if(!terms || terms.length === 0){
      return [];
    }
    return terms.sortBy('name');
  }),
  tagName: 'section',
  actions: {
    search: function(query){
      var self = this;
      this.set('searchReturned', false);
      this.set('searching', true);
      this.set('query', query);
      var terms = this.get('terms');
      this.get('store').query('mesh-descriptor', {
        q: query,
        limit: this.get('searchResultsPerPage') + 1
      }).then(function(descriptors){
        let results = descriptors.map(function(descriptor){
          return ProxiedDescriptors.create({
            content: descriptor,
            terms: terms
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
      var terms = this.get('terms');
      var query = this.get('query');
      this.get('store').query('mesh-descriptor', {
        q: query,
        limit: this.get('searchResultsPerPage') + 1,
        offset: this.get('searchPage') * this.get('searchResultsPerPage')
      }).then(function(descriptors){
        let results = descriptors.map(function(descriptor){
          return ProxiedDescriptors.create({
            content: descriptor,
            terms: terms
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
    add: function(term){
      this.sendAction('add', term.get('content'));
    },
    remove: function(term){
      this.sendAction('remove', term);
    }
  }
});
