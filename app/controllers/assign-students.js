import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isBlank, isEmpty, isPresent } from '@ember/utils';
const { gt } = computed;
const { Promise } = RSVP;

export default Controller.extend({
  store: service(),

  queryParams: ['offset', 'limit', 'filter', 'school'],
  offset: 0,
  limit: 25,
  filter: null,
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

  unassignedStudents: computed('selectedSchool', 'filter', function(){
    return new Promise(resolve => {
      let school = this.get('selectedSchool');
      this.get('store').query('user', {
        filters: {
          roles: [4],
          school: school.get('id'),
          cohorts: null,
          enabled: true
        }
      }).then(students => {
        const filter = this.get('filter');
        if (!isBlank(filter)) {
          const exp = new RegExp(filter, 'gi');
          students = students.filter(user => {
            return (isEmpty(user.get('fullName')) || user.get('fullName').match(exp));
          });
        }
        students = students.sortBy('lastName', 'firstName');
        resolve(students);
      });
    });

  }),

  actions: {
    changeSelectedSchool(schoolId){
      this.set('school', schoolId);
    },
  }
});
