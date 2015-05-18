import Ember from 'ember';
import DS from 'ember-data';

export default Ember.Component.extend({
  store: Ember.inject.service(),
  classNames: ['detail-stewards'],
  programYear: null,
  isManaging: false,
  bufferStewards: [],
  stewardsBySchool: Ember.computed('programYear.stewards.@each', function(){
    let deferred = Ember.RSVP.defer();
    let programYear = this.get('programYear');

    let stewardingSchools = [];
    programYear.get('stewards').then(stewards => {
      let promises = [];
      stewards.forEach(steward => {
        let promise = steward.get('school').then(school => {
          let stewardingSchool = stewardingSchools.find(
            obj => obj.get('id') === school.get('id')
          );
          if(!stewardingSchool){
            stewardingSchool = Ember.ObjectProxy.create({
              content: school,
              stewardingDepartments: []
            });
            stewardingSchools.pushObject(stewardingSchool);
          }
          let promise2 = steward.get('department').then(department => {
            if(department){
              let stewardingDepartments = stewardingSchool.get('stewardingDepartments');
              stewardingDepartments.pushObject(department);
              stewardingDepartments.uniq().sortBy('title');
            }
          });
          promises.pushObject(promise2);
        });

        promises.pushObject(promise);
      });
      Ember.RSVP.all(promises).then(() => {
        deferred.resolve(stewardingSchools.sortBy('title'));
      });
    });

    return DS.PromiseArray.create({
      promise: deferred.promise
    });
  }),
  actions: {
    manage: function(){
      this.get('programYear.stewards').then((stewards)=>{
        this.set('bufferStewards', stewards.toArray());
        this.set('isManaging', true);
      });
    },
    save: function(){
      let programYear = this.get('programYear');
      let stewards = programYear.get('stewards');
      let removableStewards = stewards.filter(steward => !this.get('bufferStewards').contains(steward));
      stewards.clear();
      var promises = [];
      removableStewards.forEach(steward => {
        steward.deleteRecord();
        promises.pushObject(steward.get('school').then(school => {
          school.get('programYearStewards').removeObject(steward);
          return school.save();
        }));
        promises.pushObject(steward.get('department').then(department => {
          if(department){
            department.get('programYearStewards').removeObject(steward);
            return department.save();
          }
        }));
        promises.pushObject(steward.save());
      });
      this.get('bufferStewards').forEach(function(steward){
        steward.set('programYear', programYear);
        promises.pushObject(steward.save().then(newSteward => {
          stewards.pushObject(newSteward);
          promises.pushObject(newSteward.get('school').then(school => {
            school.get('programYearStewards').addObject(newSteward);
            return school.save();
          }));
          promises.pushObject(newSteward.get('department').then(department => {
            if(department){
              department.get('programYearStewards').addObject(newSteward);
              return department.save();
            }
          }));
        }));
      });
      promises.pushObject(programYear.save());
      Ember.RSVP.all(promises).then( () => {
        this.set('isManaging', false);
      });
    },
    cancel: function(){
      this.set('bufferStewards', []);
      this.set('isManaging', false);
    },
    addStewardToBuffer: function(steward){
      this.get('bufferStewards').pushObject(steward);
    },
    removeStewardFromBuffer: function(steward){
      this.get('bufferStewards').removeObject(steward);
    },
  }
});
