import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  selected: function(){
    var self = this;
    var selected = false;
    this.get('programYear.disciplines').forEach(function(discipline){
      if(discipline.get('id') === self.get('model').get('id')){
        selected = true;
      }
    });
    return selected;
  }.property('programYear.disciplines.@each'),
    actions:{
      remove: function(discipline){
        this.get('programYear.disciplines').removeObject(discipline);
        this.set('programYear.isDirty', true);
      },
      add: function(discipline){
        this.get('programYear.disciplines').then(function(topics){
          topics.addObject(discipline);
        });
        this.set('programYear.isDirty', true);
      },
    }
});
