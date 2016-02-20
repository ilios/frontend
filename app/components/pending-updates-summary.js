import Ember from 'ember';
import DS from 'ember-data';

const { PromiseArray, PromiseObject } = DS;

const { Component, inject, RSVP, computed, isPresent } = Ember;
const { service } = inject;
const { reads, gt, sort } = computed;

export default Component.extend({
  store: service(),
  currentUser: service(),
  tagName: 'section',
  classNames: ['pending-updates-summary', 'summary-block'],
  schoolId: null,
  hasMoreThanOneSchool: gt('currentUser.model.schools.length', 1),
  schools: reads('currentUser.model.schools'),
  selectedSchool: computed('currentUser', 'schoolId', function(){
    let defer = RSVP.defer();

    this.get('currentUser').get('model').then(user => {
      user.get('schools').then(schools => {
        if(isPresent(this.get('schoolId'))){
          let school =  schools.find(school => {
            return school.get('id') === this.get('schoolId');
          });
          if(school){
            defer.resolve(school);
            return;
          }
        }
        user.get('school').then(school => {
          defer.resolve(school);
        });
      });
    });

    return PromiseObject.create({
      promise: defer.promise
    });

  }),
  sortSchoolsBy:['title'],
  sortedSchools: sort('schools', 'sortSchoolsBy'),

  updates: computed('selectedSchool', function(){
    let defer = RSVP.defer();
    this.get('selectedSchool').then(school => {
      this.get('store').query('pending-user-update', {
        limit: 1000,
        filters: {
          schools: [school.get('id')]
        }
      }).then(updates => {
        defer.resolve(updates);
      });
    });

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  actions: {
    changeSelectedSchool: function(schoolId){
      this.set('schoolId', schoolId);
    },
  }
});
