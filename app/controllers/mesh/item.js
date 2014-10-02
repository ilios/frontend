import Ember from 'ember';

export default Ember.ObjectController.extend({
  selected: function(){
    var self = this;
    var selected = false;
    this.get('parentController.linkedMeshTerms').forEach(function(term){
     if(term.get('id') === self.get('id')){
       selected = true;
     }
    });
    return selected;
  }.property('parentController.linkedMeshTerms.@each')
});
