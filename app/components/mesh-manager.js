import Ember from 'ember';
import layout from '../templates/components/mesh-manager';

var ProxiedDescriptors = Ember.ObjectProxy.extend({
  terms: [],
  isActive: function(){
    return !this.get('terms').contains(this.get('content'));
  }.property('content', 'terms.@each')
});
export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  layout: layout,
  classNames: ['mesh-manager'],
  placeholderTranslation: 'courses.meshSearchPlaceholder',
  terms: [],
  searchResults: [],
  sortBy: ['title'],
  sortedTerms: Ember.computed.sort('terms', 'sortBy'),
  actions: {
    search: function(query){
      var self = this;
      var terms = this.get('terms');
      this.store.find('mesh-descriptor', {q: query}).then(function(descriptors){
        let results = descriptors.map(function(descriptor){
          return ProxiedDescriptors.create({
            content: descriptor,
            terms: terms
          });
        });
        self.set('searchResults', results);
      });
    },
    add: function(term){
      this.sendAction('add', term.get('content'));
    },
    remove: function(term){
      this.sendAction('remove', term);
    }
  }
});
