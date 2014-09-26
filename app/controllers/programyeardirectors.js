import Ember from 'ember';

export default Ember.ArrayController.extend({
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  sortAscending: true,
  sortProperties: ['fullName'],
  searchTerm: '',
  searchResults: [],
  hasResults: function(){
    return this.get('searchResults').length > 0;
  }.property('searchResults'),
  actions: {
    search: function(){
      var self = this;
      this.store.find('user', {searchTerm: this.get('searchTerm')}).then(function(results){
        var filtered = results.filter(function(result){
          var exists = false;
          self.get('model').forEach(function(user){
            if(user.get('id') === result.get('id')){
              exists = true;
            }
          });
          return !exists;
        });
        self.set('searchResults', filtered);
      });
    },
    remove: function(user){
      this.get('programYear.directors').removeObject(user);
      this.set('programYear.isDirty', true);
    },
    add: function(user){
      this.get('programYear.directors').addObject(user);
      this.set('programYear.isDirty', true);
    },
  }
});
