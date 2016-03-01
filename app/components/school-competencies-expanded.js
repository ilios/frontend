import Ember from 'ember';

const { Component, computed, inject, RSVP } = Ember;
const { service } = inject;

export default Component.extend({
  store: service(),
  school: null,
  isManaging: false,
  bufferedCompetencies: [],
  showCollapsible: computed('isManaging', 'school.competencies.length', function(){
    const isManaging = this.get('isManaging');
    const competencies = this.get('school.competencies');
    return competencies.get('length') && ! isManaging;
  }),
  actions: {
    collapse(){
      this.get('school.competencies').then(competencies => {
        if(competencies.length){
          this.attrs.collapse();
        }
      });
    },
    manage(){
      this.get('school.competencies').then(competencies => {
        this.set('bufferedCompetencies', competencies.toArray());
        this.set('isManaging', true);
      });
    },
    addCompetencyToBuffer(title){
      let competency = this.get('store').createRecord('competency', {title});
      this.get('bufferedCompetencies').pushObject(competency);
    },
    removeCompetencyFromBuffer(competency){
      let buffer = this.get('bufferedCompetencies');
      if (buffer.contains(competency)) {
        buffer.removeObject(competency);
      }
    },
    save(){
      this.set('isSaving', true);
      let school = this.get('school');
      school.get('competencies').then(schoolCompetencies => {
        let promises = [];
        let bufferedCompetencies = this.get('bufferedCompetencies');
        schoolCompetencies.filter(competency => {
          return !bufferedCompetencies.contains(competency);
        }).forEach(competency => {
          competency.deleteRecord();
          promises.pushObject(competency.save());
        });
        bufferedCompetencies.filterBy('isNew').forEach(competency => {
          competency.set('school', school);
          promises.pushObject(competency.save());
        });
        schoolCompetencies.clear();
        bufferedCompetencies.forEach(competency=>{
          schoolCompetencies.pushObject(competency);
        });
        RSVP.all(promises).then(() => {
          this.set('isManaging', false);
          this.set('bufferedTopics', []);
          this.set('isSaving', false);
        });
      });
    },
    cancel(){
      this.set('bufferedCompetencies', []);
      this.set('isManaging', false);
    },
  }
});
