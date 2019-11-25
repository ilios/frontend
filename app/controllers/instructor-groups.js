import Controller from '@ember/controller';
import { computed } from '@ember/object';
import { gt } from '@ember/object/computed';
import { inject as service } from '@ember/service';
import { isBlank, isEmpty, isPresent } from '@ember/utils';
import { resolve } from 'rsvp';
import { task, timeout } from 'ember-concurrency';

export default Controller.extend({
  currentUser: service(),
  intl: service(),
  permissionChecker: service(),

  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter'
  },

  deletedInstructorGroup: null,
  newInstructorGroup: null,
  schoolId: null,
  showNewInstructorGroupForm: false,
  titleFilter: null,

  hasMoreThanOneSchool: gt('model.schools.length', 1),

  instructorGroups: computed('selectedSchool', 'deletedInstructorGroup', 'newInstructorGroup', async function() {
    const schoolId = this.selectedSchool.get('id');
    if(isEmpty(schoolId)) {
      resolve([]);
    }
    return await this.store.query('instructor-group', {
      filters: {
        school: schoolId
      }
    });
  }),

  filteredInstructorGroups: computed('titleFilter', 'instructorGroups.[]', async function() {
    const titleFilter = this.titleFilter;
    const title = isBlank(titleFilter) ? '' : titleFilter ;
    const instructorGroups = await this.instructorGroups;
    let filteredInstructorGroups;
    if(isEmpty(title)){
      filteredInstructorGroups = instructorGroups;
    } else {
      filteredInstructorGroups = instructorGroups.filter(instructorGroup => {
        return isPresent(instructorGroup.get('title'))
          && instructorGroup.get('title').toLowerCase().includes(title.toLowerCase());
      });
    }
    return filteredInstructorGroups.sortBy('title');
  }),

  selectedSchool: computed('model.schools.[]', 'schoolId', 'primarySchool', function() {
    const schools = this.get('model.schools');
    const primarySchool = this.get('model.primarySchool');
    const schoolId = this.schoolId;
    if(isPresent(schoolId)){
      const school =  schools.findBy('id', schoolId);
      if(school){
        return school;
      }
    }

    return primarySchool;
  }),

  canCreate: computed('selectedSchool', async function() {
    const permissionChecker = this.permissionChecker;
    const selectedSchool = this.selectedSchool;
    return permissionChecker.canCreateInstructorGroup(selectedSchool);
  }),

  canDelete: computed('selectedSchool', async function() {
    const permissionChecker = this.permissionChecker;
    const selectedSchool = this.selectedSchool;
    return permissionChecker.canDeleteInstructorGroupInSchool(selectedSchool);
  }),

  actions: {
    async removeInstructorGroup(instructorGroup) {
      const school = this.selectedSchool;
      const instructorGroups = await school.get('instructorGroups');
      instructorGroups.removeObject(instructorGroup);
      await instructorGroup.destroyRecord();
      this.set('deletedInstructorGroup', instructorGroup);
      const newInstructorGroup = this.newInstructorGroup;
      if (newInstructorGroup === instructorGroup) {
        this.set('newInstructorGroup', null);
      }
    },

    async saveNewInstructorGroup(newInstructorGroup) {
      const savedInstructorGroup = await newInstructorGroup.save();
      this.set('showNewInstructorGroupForm', false);
      this.set('newInstructorGroup', savedInstructorGroup);
      const school = await this.selectedSchool;
      const instructorGroups = await school.get('instructorGroups');
      instructorGroups.pushObject(savedInstructorGroup);
      return savedInstructorGroup;
    },

    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },

    toggleNewInstructorGroupForm() {
      this.set('showNewInstructorGroupForm', !this.showNewInstructorGroupForm);
    }
  },

  changeTitleFilter: task(function* (value) {
    this.set('titleFilter', value);
    yield timeout(250);
    return value;
  }).restartable()
});
