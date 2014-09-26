import Ember from 'ember';

export default Ember.ObjectController.extend({
  isDirty: false,
  competencies: [],
  competenciesObserver: function(){
    var self = this;
    this.get('model.competencies').then(function(competencies){
      self.set('competencies', competencies);
    });
  }.observes('model.competencies.[]'),
  actions:{
    save: function(){
      var self = this;
      this.get('model').save().then(function(){
        self.set('isDirty', false);
      });
    }
  }
});
