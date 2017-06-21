import Ember from 'ember';

const { Component, inject, computed, ArrayProxy, PromiseProxyMixin } = Ember;
const { service } = inject;


export default Component.extend({
  store: service(),
  currentUser: service(),
  tagName: 'div',
  classNameBindings: [':unassigned-students-summary', ':small-component', 'alert'],
  alert: computed.gt('unassignedStudentsProxy.length', 0),
  schoolId: null,
  schools: computed('currentUser.model.schools.[]', async function(){
    const currentUser = this.get('currentUser');
    const user = await currentUser.get('model');
    const schools = await user.get('schools');

    return schools;
  }),
  selectedSchool: computed('currentUser.model', 'schoolId', async function(){
    const currentUser = this.get('currentUser');
    const user = await currentUser.get('model');
    const schools = await this.get('schools');
    const primarySchool = await user.get('school');
    const schoolId = this.get('schoolId');

    let school = schools.findBy('id', schoolId);
    if (!school) {
      school = primarySchool;
    }

    return school;
  }),

  unassignedStudents: computed('selectedSchool', async function(){
    const selectedSchool = await this.get('selectedSchool');

    if (!selectedSchool) {
      return [];
    }
    const store = this.get('store');
    const school = selectedSchool.get('id');

    const students = await store.query('user', {
      limit: 1000,
      filters: {
        roles: [4],
        school,
        cohorts: null,
        enabled: true
      }
    });

    return students;

  }),

  //temporary solution until the classNameBindings can be promise aware
  unassignedStudentsProxy: computed('unassignedStudents', function(){
    let ap = ArrayProxy.extend(PromiseProxyMixin);
    return ap.create({
      promise: this.get('unassignedStudents')
    });
  }),
  actions: {
    changeSelectedSchool: function(schoolId){
      this.set('schoolId', schoolId);
    },
  }
});
