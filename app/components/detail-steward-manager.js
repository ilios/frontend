/* eslint ember/order-in-components: 0 */
import { inject as service } from '@ember/service';
import Component from '@ember/component';
import { computed } from '@ember/object';
import RSVP from 'rsvp';
import { isPresent } from '@ember/utils';
import { task } from 'ember-concurrency';

const { map, filter } = RSVP;

export default Component.extend({
  store: service(),
  stewards: null,
  tagName: 'section',
  classNames: ['detail-steward-manager'],
  stewardsBySchoolLoaded: false,
  availableSchoolsLoaded: false,

  /**
   * This is a hack because ember-async-helpers flickers when the CPs are evaluated
   * so we cheat and use ember-concurrency to display the values
   */
  didReceiveAttrs(){
    this._super(...arguments);
    this.get('getStewardsBySchool').perform();
    this.get('getAvailableSchools').perform();
  },
  getStewardsBySchool: task(function *(){
    const stewardsBySchool =  yield this.get('stewardsBySchool');
    this.set('stewardsBySchoolLoaded', true);
    return stewardsBySchool;
  }),
  getAvailableSchools: task(function *(){
    const availableSchools =  yield this.get('availableSchools');
    this.set('availableSchoolsLoaded', true);
    return availableSchools;
  }),

  allSchools: computed(async function(){
    const store = this.get('store');
    return await store.findAll('school');
  }),

  selectedDepartments: computed('stewards.[]', async function(){
    const stewards = this.get('stewards');
    const selectedDepartments = await map(stewards.toArray(), async steward => {
      return await steward.get('department');
    });

    return selectedDepartments.filter(department => {
      return isPresent(department);
    });
  }),

  selectedSchools: computed('stewards.[]', async function(){
    const stewards = this.get('stewards');
    const selectedDepartments = await map(stewards.toArray(), async steward => {
      return await steward.get('school');
    });

    return selectedDepartments.filter(department => {
      return isPresent(department);
    });
  }),

  stewardsBySchool: computed('stewards.[]', async function(){
    const stewards = this.get('stewards');
    const stewardObjects = await map(stewards.toArray(), async steward => {
      const school = await steward.get('school');
      const department = await steward.get('department');
      return {
        school,
        department,
      };
    });
    const schools = stewardObjects.uniqBy('school.id');
    const stewardsBySchool = schools.map(schoolObj => {
      const departments = stewardObjects.filter(obj => {
        return obj.school.get('id') === schoolObj.school.get('id') &&
               isPresent(obj.department);
      }).mapBy('department');
      delete schoolObj.department;
      schoolObj.departments = departments;

      return schoolObj;
    });

    return stewardsBySchool;
  }),

  availableSchools: computed('selectedDepartments.[]', 'selectedSchools.[]', 'allSchools.[]', async function(){
    const allSchools = await this.get('allSchools');
    const selectedDepartments = await this.get('selectedDepartments');
    const selectedSchools = await this.get('selectedSchools');

    const selectedDepartmentIds = selectedDepartments.mapBy('id');
    const selectedSchoolIds = selectedSchools.mapBy('id');
    const unselectedSchoolsAndSchoolsWithUnselectedDepartments = await filter(allSchools.toArray(), async school => {
      const departments = await school.get('departments');
      const unselectedDepartments = departments.filter(department => {
        return !selectedDepartmentIds.includes(department.get('id'));
      });
      return !selectedSchoolIds.includes(school.get('id')) || isPresent(unselectedDepartments);
    });

    const availableSchools = await map(unselectedSchoolsAndSchoolsWithUnselectedDepartments.toArray(), async school => {
      const allSchoolDepartments = await school.get('departments');
      const departments = allSchoolDepartments.filter(department => {
        return !selectedDepartmentIds.includes(department.get('id'));
      });
      return {
        school,
        departments
      };
    });

    return availableSchools;

  }),
  addSchool: task(function * (school){
    const store = this.get('store');
    const selectedDepartments = yield this.get('selectedDepartments');
    const steward = store.createRecord('program-year-steward', {
      school
    });
    this.get('add')(steward);
    const departments = yield school.get('departments');
    const newDepartments = departments.filter(department => {
      return !selectedDepartments.includes(department);
    });
    newDepartments.forEach(department => {
      const newSteward = store.createRecord('program-year-steward', {
        school,
        department
      });
      this.get('add')(newSteward);
    });
  }),
  addDepartment: task(function * (school, department){
    const store = this.get('store');
    const selectedDepartments = yield this.get('selectedDepartments');
    if (!selectedDepartments.includes(department)) {
      const steward = store.createRecord('program-year-steward', {
        school,
        department
      });
      this.get('add')(steward);
    }
  }),
  removeDepartment: task(function * (school, department){
    const stewards = this.get('stewards');
    const stewardToRemove = stewards.find(steward => {
      return department.get('id') === steward.belongsTo('department').id();
    });
    yield this.get('remove')(stewardToRemove);
  }),
  removeSchool: task(function * (school){
    const stewards = this.get('stewards');
    const stewardsToRemove = stewards.filter(steward => {
      return school.get('id') === steward.belongsTo('school').id();
    });
    for (let i = 0; i < stewardsToRemove.length; i++) {
      yield this.get('remove')(stewardsToRemove[i]);
    }
  }),
});
