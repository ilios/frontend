import Ember from 'ember';
import layout from '../templates/components/mesh-manager';
import { translationMacro as t } from "ember-i18n";

var ProxiedDescriptors = Ember.ObjectProxy.extend({
  terms: [],
  isActive: function(){
    return !this.get('terms').contains(this.get('content'));
  }.property('content', 'terms.@each')
});

export default Ember.Component.extend({
  store: Ember.inject.service(),
  i18n: Ember.inject.service(),
  layout: layout,
  classNames: ['mesh-manager'],
  placeholder: t('courses.meshSearchPlaceholder'),
  terms: [],
  searchResults: [],
  targetItemTitle: '',
  searching: false,
  searchReturned: false,
  sortTerms: ['name'],
  sortedSearchResults: Ember.computed.sort('searchResults', 'sortTerms'),
  sortedTerms: function(){
    var terms = this.get('terms');
    if(!terms || terms.length === 0){
      return [];
    }
    return terms.sortBy('name');
  }.property('terms.@each.name'),
  actions: {
    search: function(query){
      var self = this;
      this.set('searchReturned', false);
      this.set('searching', true);
      var terms = this.get('terms');
      this.get('store').query('mesh-descriptor', {q: query}).then(function(descriptors){
        let results = descriptors.map(function(descriptor){
          return ProxiedDescriptors.create({
            content: descriptor,
            terms: terms
          });
        });
        self.set('searchReturned', true);
        self.set('searching', false);
        self.set('searchResults', results);
      });
    },
    clear: function(){
      this.set('searchResults', []);
      this.set('searchReturned', false);
      this.set('searching', false);
    },
    add: function(term){
      this.sendAction('add', term.get('content'));
    },
    remove: function(term){
      this.sendAction('remove', term);
    }
  }
});
