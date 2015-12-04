import Ember from 'ember';

const { Component } = Ember;

export default Component.extend({
  programYear: null,
  classNames: ['programyear-competencies'],
  isManaging: false,
  isSaving: false,
  bufferCompetencies: [],
  actions: {
    manage: function(){
      var self = this;
      this.get('programYear.competencies').then(function(competencies){
        self.set('bufferCompetencies', competencies.toArray());
        self.set('isManaging', true);
      });
    },
    save: function(){
      this.set('isSaving', true);
      let programYear = this.get('programYear');
      programYear.get('competencies').then(competencies => {
        competencies.clear();
        this.get('bufferCompetencies').forEach(competency => {
          competency.get('programYears').addObject(programYear);
          competencies.addObject(competency);
        });
        programYear.save().then(()=> {
          this.set('isSaving', false);
          this.set('isManaging', false);
        });
      });
    },
    cancel: function(){
      this.set('bufferCompetencies', []);
      this.set('isManaging', false);
    },
    addCompetencyToBuffer: function(competency){
      this.get('bufferCompetencies').addObject(competency);
      competency.get('children').then(children => {
        this.get('bufferCompetencies').addObjects(children);
      });
    },
    removeCompetencyFromBuffer: function(competency){
      this.get('bufferCompetencies').removeObject(competency);
      competency.get('children').then(children => {
        children.forEach(child => {
          this.get('bufferCompetencies').removeObject(child);
        });
      });
    }
  }
});
