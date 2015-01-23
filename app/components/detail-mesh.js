import Ember from 'ember';

export default Ember.Component.extend(Ember.I18n.TranslateableProperties, {
  placeholderTranslation: 'courses.meshSearchPlaceholder',
  terms: [],
  searchResults: [],
  filteredSearchResults: function(){
    var terms = this.get('terms');
    var avail = this.get('searchResults').filter(function(term){
      return !terms.contains(term);
    });

    return avail.sortBy('title');
  }.property('searchResults.@each', 'terms.@each'),
  actions: {
    search: function(searchTerm){
      var self = this;
      this.store.find('mesh-descriptor', {searchTerm: searchTerm}).then(function(descriptors){
        self.set('searchResults', descriptors);
      });
    },
    add: function(term){
      this.sendAction('addTerm', term);
    },
    remove: function(term){
      this.sendAction('removeTerm', term);
    }
  }
});
