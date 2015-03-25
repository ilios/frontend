import Ember from 'ember';
import layout from '../templates/components/mesh-manager';

var ProxiedDescriptors = Ember.ObjectProxy.extend({
  terms: [],
  isActive: function(){
    return !this.get('terms').contains(this.get('content'));
  }.property('content', 'terms.@each')
});
export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  store: Ember.inject.service(),
  layout: layout,
  classNames: ['mesh-manager'],
  placeholderTranslation: 'courses.meshSearchPlaceholder',
  terms: [],
  searchResults: [],
  sortedTerms: function(){
    var terms = this.get('terms');
    if(!terms || terms.length === 0){
      return [];
    }
    return terms.sortBy('title');
  }.property('terms.@each.title'),
  actions: {
    search: function(query){
      var self = this;
      var terms = this.get('terms');
      this.get('store').find('mesh-descriptor', {q: query}).then(function(descriptors){
        let results = descriptors.map(function(descriptor){
          return ProxiedDescriptors.create({
            content: descriptor,
            terms: terms
          });
        });
        self.set('searchResults', results);
      });
    },
    clear: function(){
      this.set('searchResults', []);
    },
    add: function(term){
      this.sendAction('add', term.get('content'));
    },
    remove: function(term){
      this.sendAction('remove', term);
    }
  }
});
