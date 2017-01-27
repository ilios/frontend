import Ember from 'ember';

const { Component, inject, RSVP, computed, isPresent } = Ember;
const { service } = inject;
const { Promise } = RSVP;
const { reads, gt, sort } = computed;

export default Component.extend({
  store: service(),
  currentUser: service(),
  tagName: 'div',
  classNameBindings: [':pending-updates-summary', ':small-component', 'alert'],
  alert: computed.gt('updates.length', 0),
  schoolId: null,
  hasMoreThanOneSchool: gt('currentUser.model.schools.length', 1),
  schools: reads('currentUser.model.schools'),

  /**
   * The currently selected school, defaults to the current-user's primary school if none is selected.
   * @property selectedSchool
   * @type {Ember.computed}
   * @public
   */
  selectedSchool: computed('currentUser', 'schoolId', function(){
    return new Promise(resolve => {
      this.get('currentUser').get('model').then(user => {
        user.get('schools').then(schools => {
          if(isPresent(this.get('schoolId'))){
            let school =  schools.find(school => {
              return school.get('id') === this.get('schoolId');
            });
            if(school){
              resolve(school);
              return;
            }
          }
          user.get('school').then(school => {
            resolve(school);
          });
        });
      });
    });
  }),
  sortSchoolsBy:['title'],
  sortedSchools: sort('schools', 'sortSchoolsBy'),

  /**
   * A list of pending user updates.
   * @property updates
   * @type {Ember.computed}
   * @public
   */
  updates: computed('selectedSchool', function(){
    return new Promise(resolve => {
      this.get('selectedSchool').then(school => {
        this.get('store').query('pending-user-update', {
          limit: 1000,
          filters: {
            schools: [school.get('id')]
          }
        }).then(updates => {
          resolve(updates);
        });
      });
    });
  }),

  actions: {
    changeSelectedSchool: function(schoolId){
      this.set('schoolId', schoolId);
    },
  }
});
