import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed } = Ember;

export default Component.extend({
  store: Ember.inject.service(),
  classNames: ['detail-stewards'],
  programYear: null,
  isManaging: false,
  bufferStewards: [],
  stewardsBySchool: computed('programYear.stewards.@each', function(){
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
      programYear.get('stewards').then(stewards => {
        let removableStewards = stewards.filter(steward => !this.get('bufferStewards').contains(steward));
        stewards.clear();
        var promises = [];
        removableStewards.forEach(steward => {
          promises.pushObject(steward.get('school').then(school => {
            school.get('stewards').removeObject(steward);
          }));
          promises.pushObject(steward.get('department').then(department => {
            if(department){
              department.get('stewards').removeObject(steward);
            }
          }));
          steward.deleteRecord();
          promises.pushObject(steward.save());
        });
        this.get('bufferStewards').forEach(function(steward){
          steward.set('programYear', programYear);
          stewards.pushObject(steward);
          promises.pushObject(steward.get('school').then(school => {
            school.get('stewards').addObject(steward);
          }));
          promises.pushObject(steward.get('department').then(department => {
            if(department){
              department.get('stewards').addObject(steward);
            }
          }));
          promises.pushObject(steward.save());
        });
        Ember.RSVP.all(promises).then( () => {
          this.set('isManaging', false);
        });
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
