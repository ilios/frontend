import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['programyeardirectors', 'programyear'],
  programYearDirectors: Ember.computed.alias("controllers.programyeardirectors"),
  programYear: Ember.computed.alias("controllers.programyear"),
  selected: function(){
    var self = this;
    var selected = false;
    this.get('programYearDirectors.directors').forEach(function(user){
      if(user.get('id') === self.get('model').get('id')){
        selected = true;
      }
    });
    return selected;
  }.property('model', 'programYearDirectors.directors.@each'),
  actions: {
    add: function(user){
      this.get('programYearDirectors.directors').addObject(user);
      this.set('programYear.isDirty', true);
    },
  }
});
