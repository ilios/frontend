import Ember from 'ember';

const { Controller, computed, RSVP, inject, isPresent, isEmpty } = Ember;
const { gt } = computed;
const { service } = inject;
const { Promise } = RSVP;

export default Controller.extend({
  store: service(),

  queryParams: ['offset', 'limit', 'filter', 'school'],
  offset: 0,
  limit: 25,
  filter: '',
  school: null,
  hasMoreThanOneSchool: gt('model.schools.length', 1),
  selectedSchool: computed('model.schools.[]', 'model.primarySchool', 'school', function(){
    if(isPresent(this.get('school'))){
      let school =  this.get('model.schools').findBy('id', this.get('school'));
      if(school){
        return school;
      }
    }
    return this.get('model.primarySchool');
  }),

  unassignedStudents: computed('selectedSchool', function(){
    return new Promise(resolve => {
      let school = this.get('selectedSchool')
      this.get('store').query('user', {
        limit: 1000,
        filters: {
          roles: [4],
          school: school.get('id'),
          cohorts: null,
          enabled: true
        }
      }).then(students => {
        const filter = this.get('filter');
        const exp = new RegExp(filter, 'gi');
        let displayed = students.filter(user => {
          return (isEmpty(user.get('fullName')) || user.get('fullName').match(exp));
        })
        .sortBy('lastName', 'firstName');

        resolve(displayed);
      });
    });

  }),

  actions: {
    changeSelectedSchool(schoolId){
      this.set('school', schoolId);
    },
  }
});
