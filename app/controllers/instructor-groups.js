import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";
import escapeRegExp from '../utils/escape-reg-exp';

const { computed, Controller, RSVP, isEmpty, isPresent, inject, observer } = Ember;
const { gt } = computed;
const { service } = inject;
const { PromiseArray } = DS;

export default Controller.extend({
  i18n: service(),
  currentUser: service(),
  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter'
  },
  placeholderValue: t('general.instructorGroupTitleFilterPlaceholder'),
  schoolId: null,
  titleFilter: null,
  showNewInstructorGroupForm: false,
  newInstructorGroups: [],
  instructorGroups: computed('selectedSchool', function(){
    let defer = RSVP.defer();
    let schoolId = this.get('selectedSchool').get('id');
    if(isEmpty(schoolId)){
      defer.resolve([]);
    } else {
      this.get('store').query('instructor-group', {
        filters: {
          school: schoolId
        },
        limit: 500
      }).then(instructorGroups => {
        defer.resolve(instructorGroups);
      });
    }

    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  //in order to delay rendering until a user is done typing debounce the title filter
  debouncedFilter: null,
  watchFilter: observer('titleFilter', function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }),
  setFilter: function(){
    const titleFilter = this.get('titleFilter');
    const clean = escapeRegExp(titleFilter);
    this.set('debouncedFilter', clean);
  },
  hasMoreThanOneSchool: gt('model.schools.length', 1),
  filteredInstructorGroups: computed(
    'debouncedFilter',
    'instructorGroups.[]',
    function(){
      let defer = RSVP.defer();
      let title = this.get('debouncedFilter');
      let exp = new RegExp(title, 'gi');
      this.get('instructorGroups').then(instructorGroups => {
        let filteredInstructorGroups;
        if(isEmpty(title)){
          filteredInstructorGroups = instructorGroups;
        } else {
          filteredInstructorGroups = instructorGroups.filter(instructorGroup => {
            return isPresent(instructorGroup.get('title')) && instructorGroup.get('title').match(exp);
          });
        }
        defer.resolve(filteredInstructorGroups.sortBy('title'));
      });


      return PromiseArray.create({
        promise: defer.promise
      });
    }
  ),
  selectedSchool: computed('model.schools.[]', 'schoolId', 'primarySchool', function(){
    const schools = this.get('model.schools');
    const primarySchool = this.get('model.primarySchool');
    if(isPresent(this.get('schoolId'))){
      let school =  schools.find(school => school.get('id') === this.get('schoolId'));
      if(school){
        return school;
      }
    }

    return primarySchool;
  }),
  actions: {
    removeInstructorGroup: function(instructorGroup){
      instructorGroup.deleteRecord();
      instructorGroup.save();
    },
    saveNewInstructorGroup: function(newInstructorGroup){
      let newInstructorGroups = this.get('newInstructorGroups').toArray();
      return newInstructorGroup.save().then(savedInstructorGroup => {
        newInstructorGroups.pushObject(savedInstructorGroup);
        this.set('newInstructorGroups', newInstructorGroups);
        this.set('showNewInstructorGroupForm', false);
      });
    },
    changeSelectedSchool: function(schoolId){
      this.set('schoolId', schoolId);
    },
    toggleNewInstructorGroupForm: function(){
      this.set('showNewInstructorGroupForm', !this.get('showNewInstructorGroupForm'));
    }
  },
});
