import Ember from 'ember';

export default Ember.Mixin.create({
  linkedMeshTerms: Ember.computed.alias("model.meshDescriptors"),
  searchResults: [],
  showResults: false,
  hasResults: function(){
    return this.get('searchResults').length > 0;
  }.property('searchResults'),
  actions: {
    searchMeshDescriptors: function(){
      var self = this;
      if(this.get('searchTerm').length < 1){
        this.set('showResults', false);
        return;
      }
      this.store.find('meshDescriptor', {searchTerm: this.get('searchTerm')}).then(function(results){
        self.set('searchResults', results.sortBy('name'));
        self.set('showResults', true);
      });
    },
    removeMeshDescriptor: function(descriptor){
      this.get('model.meshDescriptors').removeObject(descriptor);
    },
    addMeshDescriptor: function(descriptor){
      this.get('model.meshDescriptors').addObject(descriptor);
    }
  }
});
