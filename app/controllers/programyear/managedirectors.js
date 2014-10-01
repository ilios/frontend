import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  directors: Ember.computed.alias("model"),
  sortAscending: true,
  sortProperties: ['fullName'],
  searchTerm: '',
  showResults: false,
  searchResults: [],
  hasResults: function(){
    return this.get('searchResults').length > 0;
  }.property('searchResults'),
  actions: {
    search: function(){
      var self = this;
      if(this.get('searchTerm').length < 1){
        this.set('showResults', false);
        return;
      }
      this.store.find('user', {searchTerm: this.get('searchTerm')}).then(function(results){
        self.set('searchResults', results.sortBy('lastName', 'firstName'));
        self.set('showResults', true);
      });
    },
    remove: function(user){
      this.get('programYear.directors').removeObject(user);
      this.set('programYear.isDirty', true);
    }
  }
});
