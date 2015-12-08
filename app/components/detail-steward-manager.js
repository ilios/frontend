import Ember from 'ember';
import DS from 'ember-data';

const { Component, computed } = Ember;
const { filter, mapBy } = computed;

export default Component.extend({
  store: Ember.inject.service(),
  stewards: [],
  tagName: 'section',
  classNames: ['detail-block'],
  stewardedDepartmentlessSchools: filter('stewards', function(steward){
    return !steward.get('department.content');
  }),
  stewardedSchools: mapBy('stewardedDepartmentlessSchools', 'school'),
  selectedSchools: mapBy('stewardedSchools', 'content'),
  stewardedDepartments: mapBy('stewards', 'department'),
  selectedDepartments: mapBy('stewardedDepartments', 'content'),
  schools: computed(function(){
    return DS.PromiseArray.create({
      promise: this.get('store').findAll('school')
    });
  }),
  availableSchools: computed('stewardedSchools.[]', 'stewardedDepartments.[]', 'schools.[]', function(){
    let defer = Ember.RSVP.defer();
    let schoolProxy = Ember.ObjectProxy.extend({
      departments: [],
      selectedSchools: [],
      //display those with departments or those who are not already solo-assigned
      display: computed('content', 'departments.length', function(){
        return this.get('departments').length > 0 ||
               !this.get('selectedSchools').contains(this.get('content'));
      }),
    });
    this.get('schools').then(schools => {
      let promises = [];
      let schoolProxies = [];
      schools.forEach(school => {
        let proxy = schoolProxy.create({
          content: school,
          selectedSchools: this.get('selectedSchools')
        });
        let promise = school.get('departments').then(departments => {
          let filteredDepartments = departments.filter(
             department => !this.get('selectedDepartments').contains(department)
          );
          proxy.set('departments', filteredDepartments);
          schoolProxies.pushObject(proxy);
        });
        promises.pushObject(promise);
      });
      Ember.RSVP.all(promises).then(()=>{
        defer.resolve(schoolProxies.filterBy('display').sortBy('title'));
      });
    });

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  stewardSchools: computed('selectedSchools.[]', 'selectedDepartments.[]', 'schools.[]', function(){
    let defer = Ember.RSVP.defer();
    let schoolProxy = Ember.ObjectProxy.extend({
      departments: [],
      selectedSchools: [],
      //display those with departments or those who are not already solo-assigned
      display: computed('content', 'departments.length', function(){
        return this.get('departments').length > 0 ||
               this.get('selectedSchools').contains(this.get('content'));
      })
    });
    this.get('schools').then(schools => {
      let promises = [];
      let schoolProxies = [];
      schools.forEach(school => {
        let proxy = schoolProxy.create({
          content: school,
          selectedSchools: this.get('selectedSchools')
        });
        let promise = school.get('departments').then(departments => {
          let filteredDepartments = departments.filter(
             department => this.get('selectedDepartments').contains(department)
          );
          proxy.set('departments', filteredDepartments);
          schoolProxies.pushObject(proxy);
        });
        promises.pushObject(promise);
      });
      Ember.RSVP.all(promises).then(()=>{
        defer.resolve(schoolProxies.filterBy('display').sortBy('title'));
      });
    });

    return DS.PromiseArray.create({
      promise: defer.promise
    });
  }),
  actions: {
    addSchool: function(schoolProxy){
      let steward = this.get('store').createRecord('program-year-steward', {
        school: schoolProxy.get('content'),
      });
      this.sendAction('add', steward);
      schoolProxy.get('content').get('departments').then(departments => {
        let selectedDepartments = this.get('stewardedDepartments').mapBy('content');
        let newDepartments = departments.filter(deparment => !selectedDepartments.contains(deparment));
        newDepartments.forEach(department => {
          let steward = this.get('store').createRecord('program-year-steward', {
            school: schoolProxy.get('content'),
            department: department
          });
          this.sendAction('add', steward);
        });
      });
    },
    addDepartment: function(schoolProxy, department){
      let steward = this.get('store').createRecord('program-year-steward', {
        school: schoolProxy.get('content'),
        department: department,
      });
      this.sendAction('add', steward);
    },
    removeSchool: function(school){
      let steward = this.get('stewards').find(steward => {
        return steward.get('school.id') === school.get('id') && !steward.get('department.content');
      });
      if(steward){
        this.sendAction('remove', steward);
      }
      school.get('departments').then(departments => {
        departments.forEach(department => {
          let steward = this.get('stewards').find(steward => {
            return steward.get('school.id') === school.get('id') &&
            steward.get('department.id') === department.get('id');
          });
          if(steward){
            this.sendAction('remove', steward);
          }
        });
      });
    },
    removeDepartment: function(school, department){
      let steward = this.get('stewards').find(steward => {
        return steward.get('school.id') === school.get('id') &&
        steward.get('department.id') === department.get('id');
      });
      if(steward){
        this.sendAction('remove', steward);
      }
    },
  }
});
