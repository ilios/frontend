import Ember from 'ember';

export default Ember.ObjectController.extend({
  needs: ['programyear'],
  programYear: Ember.computed.alias("controllers.programyear"),
  children: function(){
    return this.get('model.children');
  }.property('model.children.[]'),
  selected: false,
  hasChildren: function(){
    return this.get('children.length') > 0;
  }.property('children'),
  selectedObserver: function(){
    var self = this;
    var selected = false;
    this.get('programYear.competencies').forEach(function(competency){
      if(competency.get('id') === self.get('model').get('id')){
        selected = true;
      }
    });
    this.set('selected', selected);
  }.observes('programYear.competencies.[]').on('init'),
    actions:{
      remove: function(competency){
        var self = this;
        this.get('programYear.competencies').removeObject(competency);
        competency.get('children').then(function(competencies){
          competencies.forEach(function(competency){
            self.get('programYear.competencies').removeObject(competency);
          });
        });
        this.set('programYear.isDirty', true);
      },
      add: function(competency){
        var self = this;
        this.get('programYear.competencies').addObject(competency);
        competency.get('children').then(function(competencies){
          competencies.forEach(function(competency){
            self.get('programYear.competencies').addObject(competency);
          });
        });
        this.set('programYear.isDirty', true);
      },
    }
});
