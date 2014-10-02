import Ember from 'ember';

export default Ember.ObjectController.extend({
  breadCrumb: Ember.computed.alias("model.academicYear"),
  isDirty: false,
  competencies: [],
  competenciesObserver: function(){
    var self = this;
    this.get('model.competencies').then(function(competencies){
      self.set('competencies', competencies);
    });
  }.observes('model.competencies.@each'),
  actions:{
    save: function(){
      var self = this;

      var saveArr = [];
      this.get('model.objectives').forEach(function(objective){
        saveArr.push(objective.save());
      });
      saveArr.push(this.get('model').save());

      Ember.RSVP.all(saveArr).then(function(){
        self.set('isDirty', false);
      });
    }
  }
});
