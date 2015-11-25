import Ember from 'ember';

const { RSVP } = Ember;

export default Ember.Component.extend({
  classNames: ['detail-cohorts'],
  subject: null,
  isManaging: false,
  isSaving: false,
  bufferedCohorts: [],
  actions: {
    manage(){
      this.get('course.cohorts').then(cohorts => {
        this.set('bufferedCohorts', cohorts.toArray());
        this.set('isManaging', true);
      });
    },
    save(){
      this.set('isSaving', true);
      const course = this.get('course');
      course.get('cohorts').then(cohortList => {
        let bufferedCohorts = this.get('bufferedCohorts');
        let removedCohorts = cohortList.filter(cohort => {
          return !bufferedCohorts.contains(cohort);
        });
        cohortList.clear();
        bufferedCohorts.forEach(cohort=>{
          cohortList.pushObject(cohort);
        });
        RSVP.all(removedCohorts.mapBy('programYear')).then(programYearsToRemove => {
          course.get('objectives').then(objectives => {  
            RSVP.all(objectives.invoke('removeParentWithProgramYears', programYearsToRemove)).then(()=> {
              course.save().then(()=>{
                this.set('isManaging', false);
                this.set('bufferedCohorts', []);
                this.set('isSaving', false);
              });
            });
          });
          
          
        });
        
      });
      
    },
    cancel(){
      this.set('bufferedCohorts', []);
      this.set('isManaging', false);
    },
    addCohortToBuffer(cohort){
      this.get('bufferedCohorts').pushObject(cohort);
    },
    removeCohortFromBuffer(cohort){
      this.get('bufferedCohorts').removeObject(cohort);
    },
  }
});
