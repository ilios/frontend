import Ember from 'ember';
import DS from 'ember-data';
import { translationMacro as t } from "ember-i18n";

const { computed, RSVP, isEmpty, isPresent, inject } = Ember;
const { gt } = computed;
const { service } = inject;
const { PromiseArray } = DS;

export default Ember.Controller.extend({
  i18n: service(),
  currentUser: service(),
  queryParams: {
    schoolId: 'school',
    titleFilter: 'filter'
  },
  placeholderValue: t('instructorGroups.titleFilterPlaceholder'),
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
  watchFilter: function(){
    Ember.run.debounce(this, this.setFilter, 500);
  }.observes('titleFilter'),
  setFilter: function(){
    this.set('debouncedFilter', this.get('titleFilter'));
  },
  hasMoreThanOneSchool: gt('model.length', 1),
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
  }),
  selectedSchool: computed('model.[]', 'schoolId', function(){
    let schools = this.get('model');
    if(isPresent(this.get('schoolId'))){
      let school =  schools.find(school => {
        return school.get('id') === this.get('schoolId');
      });
      if(school){
        return school;
      }
    }
    return schools.get('firstObject');
  }),
  actions: {
    removeInstructorGroup: function(instructorGroup){
      instructorGroup.deleteRecord();
      instructorGroup.save();
    },
    saveNewInstructorGroup: function(newInstructorGroup){
      newInstructorGroup.save().then(savedInstructorGroup => {
        this.get('newInstructorGroups').pushObject(savedInstructorGroup);
        this.set('showNewInstructorGroupForm', false);
      });
    },
    changeSelectedSchool: function(school){
      this.set('schoolId', school.get('id'));
    },
    toggleNewInstructorGroupForm: function(){
      this.set('showNewInstructorGroupForm', !this.get('showNewInstructorGroupForm'));
    }
  },
});
