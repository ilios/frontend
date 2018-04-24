/* eslint ember/order-in-controllers: 0 */
import { inject as service } from '@ember/service';
import { computed } from '@ember/object';
import Controller from '@ember/controller';
import { resolve } from 'rsvp';
import { isPresent, isEmpty, isBlank } from '@ember/utils';
import { task, timeout } from 'ember-concurrency';
import escapeRegExp from '../utils/escape-reg-exp';

import config from 'ilios/config/environment';
const { IliosFeatures: { enforceRelationshipCapabilityPermissions } } = config;

const { gt } = computed;

export default Controller.extend({
  i18n: service(),
  currentUser: service(),
  permissionChecker: service(),
  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter'
  },
  schoolId: null,
  titleFilter: null,
  showNewInstructorGroupForm: false,
  newInstructorGroup: null,
  deletedInstructorGroup: null,

  instructorGroups: computed('selectedSchool', 'deletedInstructorGroup', 'newInstructorGroup', async function(){
    let schoolId = this.get('selectedSchool').get('id');
    if(isEmpty(schoolId)) {
      resolve([]);
    }
    return await this.get('store').query('instructor-group', {
      filters: {
        school: schoolId
      }
    });
  }),

  changeTitleFilter: task(function * (value) {
    this.set('titleFilter', value);
    yield timeout(250);
    return value;
  }).restartable(),

  hasMoreThanOneSchool: gt('model.schools.length', 1),

  filteredInstructorGroups: computed('titleFilter', 'instructorGroups.[]', async function(){
    const titleFilter = this.get('titleFilter');
    const title = isBlank(titleFilter) ? '' : titleFilter ;
    const cleanTitle = escapeRegExp(title);
    let exp = new RegExp(cleanTitle, 'gi');
    const instructorGroups = await this.get('instructorGroups');
    let filteredInstructorGroups;
    if(isEmpty(title)){
      filteredInstructorGroups = instructorGroups;
    } else {
      filteredInstructorGroups = instructorGroups.filter(instructorGroup => {
        return isPresent(instructorGroup.get('title')) && instructorGroup.get('title').match(exp);
      });
    }
    return filteredInstructorGroups.sortBy('title');
  }),

  selectedSchool: computed('model.schools.[]', 'schoolId', 'primarySchool', function(){
    const schools = this.get('model.schools');
    const primarySchool = this.get('model.primarySchool');
    const schoolId = this.get('schoolId');
    if(isPresent(schoolId)){
      let school =  schools.findBy('id', schoolId);
      if(school){
        return school;
      }
    }

    return primarySchool;
  }),
  canCreate: computed('selectedSchool', 'currentUser', async function () {
    if (!enforceRelationshipCapabilityPermissions) {
      return true;
    }
    const permissionChecker = this.get('permissionChecker');
    const selectedSchool = this.get('selectedSchool');
    return permissionChecker.canCreateInstructorGroup(selectedSchool);
  }),
  canDelete: computed('selectedSchool', 'currentUser', async function () {
    if (!enforceRelationshipCapabilityPermissions) {
      return true;
    }
    const permissionChecker = this.get('permissionChecker');
    const selectedSchool = this.get('selectedSchool');
    return permissionChecker.canDeleteInstructorGroupInSchool(selectedSchool);
  }),
  actions: {
    async removeInstructorGroup(instructorGroup) {
      const school = this.get('selectedSchool');
      const instructorGroups = await school.get('instructorGroups');
      instructorGroups.removeObject(instructorGroup);
      await instructorGroup.destroyRecord();
      this.set('deletedInstructorGroup', instructorGroup);
      const newInstructorGroup = this.get('newInstructorGroup');
      if (newInstructorGroup === instructorGroup) {
        this.set('newInstructorGroup', null);
      }
    },

    async saveNewInstructorGroup(newInstructorGroup){
      const savedInstructorGroup = await newInstructorGroup.save();
      this.set('showNewInstructorGroupForm', false);
      this.set('newInstructorGroup', savedInstructorGroup);
      const school = await this.get('selectedSchool');
      const instructorGroups = await school.get('instructorGroups');
      instructorGroups.pushObject(savedInstructorGroup);
      return savedInstructorGroup;
    },

    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },
    toggleNewInstructorGroupForm() {
      this.set('showNewInstructorGroupForm', !this.get('showNewInstructorGroupForm'));
    }
  },
});
