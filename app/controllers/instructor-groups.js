import Ember from 'ember';
import { task, timeout } from 'ember-concurrency';
import escapeRegExp from '../utils/escape-reg-exp';

const { computed, Controller, RSVP, isBlank, isEmpty, isPresent, inject } = Ember;
const { gt } = computed;
const { resolve } = RSVP;
const { service } = inject;

export default Controller.extend({
  i18n: service(),
  currentUser: service(),
  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter'
  },
  schoolId: null,
  titleFilter: null,
  showNewInstructorGroupForm: false,
  newInstructorGroups: [],

  instructorGroups: computed('selectedSchool', async function(){
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
  filteredInstructorGroups: computed(
    'changeTitleFilter.lastSuccessful.value',
    'instructorGroups.[]',
    async function(){
      let title = this.get('changeTitleFilter.lastSuccessful.value');
      if (!isPresent(title)) {
        const titleFilter = this.get('titleFilter');
        title = isBlank(titleFilter) ? '' : titleFilter ;
      }
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
    }
  ),
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
  actions: {
    removeInstructorGroup(instructorGroup) {
      instructorGroup.deleteRecord();
      instructorGroup.save();
    },
    saveNewInstructorGroup(newInstructorGroup) {
      let newInstructorGroups = this.get('newInstructorGroups').toArray();
      return newInstructorGroup.save().then(savedInstructorGroup => {
        newInstructorGroups.pushObject(savedInstructorGroup);
        this.set('newInstructorGroups', newInstructorGroups);
        this.set('showNewInstructorGroupForm', false);
      });
    },
    changeSelectedSchool(schoolId) {
      this.set('schoolId', schoolId);
    },
    toggleNewInstructorGroupForm() {
      this.set('showNewInstructorGroupForm', !this.get('showNewInstructorGroupForm'));
    }
  },
});
