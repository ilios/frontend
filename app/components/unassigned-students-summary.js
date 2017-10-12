import { gt } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';
import ArrayProxy from '@ember/array/proxy';
import PromiseProxyMixin from '@ember/object/promise-proxy-mixin';
const { Promise } = RSVP;


export default Component.extend({
  store: service(),
  currentUser: service(),
  tagName: 'div',
  classNameBindings: [':unassigned-students-summary', ':small-component', 'alert'],
  alert: gt('unassignedStudentsProxy.length', 0),
  schoolId: null,
  schools: computed('currentUser.model.schools.[]', function(){
    return new Promise(resolve => {
      this.get('currentUser.model').then(user => {
        user.get('schools').then(schools => {
          resolve(schools);
        });
      });
    });
  }),
  selectedSchool: computed('currentUser', 'schoolId', function(){
    return new Promise(resolve => {
      this.get('currentUser').get('model').then(user => {
        user.get('schools').then(schools => {
          if(isPresent(this.get('schoolId'))){
            let school =  schools.findBy('id', this.get('schoolId'));
            if(school){
              resolve(school);
              return;
            }
          }
          resolve(user.get('school'));
        });
      });
    });
  }),

  unassignedStudents: computed('selectedSchool', function(){
    return new Promise(resolve => {
      this.get('selectedSchool').then(school => {
        this.get('store').query('user', {
          filters: {
            roles: [4],
            school: school.get('id'),
            cohorts: null,
            enabled: true
          }
        }).then(students => {
          resolve(students);
        });
      });
    });

  }),

  //temporary solution until the classNameBindings can be promise aware
  unassignedStudentsProxy: computed('unassignedStudents', function(){
    let ap = ArrayProxy.extend(PromiseProxyMixin);
    return ap.create({
      promise: this.get('unassignedStudents')
    });
  }),
  actions: {
    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },
  }
});
