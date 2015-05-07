import Ember from 'ember';

export default Ember.Component.extend({
  programYear: null,
  classNames: ['programyear-competencies'],
  isManaging: false,
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
      var programYear = this.get('programYear');
      var competencies = programYear.get('competencies');
      competencies.clear();
      competencies.addObjects(this.get('bufferCompetencies'));
      this.get('bufferCompetencies').forEach(function(competency){
        competency.get('programYears').addObject(programYear);
        competency.save();
      });
      programYear.save();
      this.set('isManaging', false);
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
