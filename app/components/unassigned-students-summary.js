/* eslint ember/order-in-components: 0 */
import { gt } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import RSVP from 'rsvp';
import { computed } from '@ember/object';
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
  schools: null,
  selectedSchool: computed('currentUser', 'schoolId', async function () {
    const schools = this.get('schools');
    const currentUser = this.get('currentUser');
    const schoolId = this.get('schoolId');

    if (schoolId) {
      return schools.findBy('id', schoolId);
    }
    const user = await currentUser.get('model');
    const school = await user.get('school');
    const defaultSchool = schools.findBy('id', school.get('id'));
    if (defaultSchool) {
      return defaultSchool;
    }

    return schools.get('firstObject');
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
