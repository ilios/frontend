import Ember from 'ember';
import DS from 'ember-data';
import ajax from 'ic-ajax';

const { computed, observer, on, RSVP, isEmpty } = Ember;
const { PromiseArray } = DS;

export default Ember.Service.extend({
  store: Ember.inject.service(),
  currentUserId: null,

  model: computed('currentUserId', function(){
    let deferred = Ember.RSVP.defer();
    let currentUserId = this.get('currentUserId');
    if (!currentUserId) {
      var url = '/auth/whoami';
      ajax(url).then(data => {
        if(data.userId){
          this.set('currentUserId', data.userId);
          this.get('store').find('user', data.userId).then((user) => {
            deferred.resolve(user);
          });
        } else {
          deferred.resolve(null);
        }
      }, () => {
        deferred.resolve(null);
      });
    } else {
      this.get('store').find('user', currentUserId).then((user) => {
        deferred.resolve(user);
      });
    }

    return DS.PromiseObject.create({
      promise: deferred.promise
    });
  }),

  availableCohortsObserver: observer('availableCohorts.@each', function(){
    var self = this;
    this.get('availableCohorts').then(function(cohorts){
      if(!cohorts.contains(self.get('currentCohort'))){
        self.set('currentCohort', null);
      }
    });
  }),
  currentCohort: null,
  availableCohorts: computed('currentSchool', function(){
    var self = this;
    return new Ember.RSVP.Promise(function(resolve) {
      self.get('currentSchool').then(function(school){
        school.get('programs').then(function(programs){
          var promises = programs.map(function(program){
            return program.get('programYears');
          });
          Ember.RSVP.hash(promises).then(function(hash){
            var promises = [];
            Object.keys(hash).forEach(function(key) {
              hash[key].forEach(function(programYear){
                promises.push(programYear.get('cohort'));
              });
            });
            Ember.RSVP.hash(promises).then(function(hash){
              var cohorts = Ember.A();
              Object.keys(hash).forEach(function(key) {
                cohorts.pushObject(hash[key]);
              });
              resolve(cohorts);
            });
          });
        });
      });
    });
  }),
  userRoleTitles: computed('model.roles.[]', function(){
    return new Ember.RSVP.Promise((resolve) => {
      this.get('model').then(user => {
        if(!user){
          resolve([]);
        } else {
          user.get('roles').then(roles => {
            let roleTitles = roles.map(role => role.get('title').toLowerCase());
            resolve(roleTitles);
          });
        }
      });
    });
  }),
  userIsCourseDirector: computed('useRoleTitles.[]', function(){
    return new Ember.RSVP.Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.contains('course director'));
      });
    });
  }),
  userIsFaculty: computed('useRoleTitles.[]', function(){
    return new Ember.RSVP.Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.contains('faculty'));
      });
    });
  }),
  userIsDeveloper: computed('useRoleTitles.[]', function(){
    return new Ember.RSVP.Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.contains('developer'));
      });
    });
  }),
  userIsStudent: computed('useRoleTitles.[]', function(){
    return new Ember.RSVP.Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.contains('student'));
      });
    });
  }),
  userIsPublic: computed('useRoleTitles.[]', function(){
    return new Ember.RSVP.Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.contains('public'));
      });
    });
  }),
  userIsFormerStudent: computed('useRoleTitles.[]', function(){
    return new Ember.RSVP.Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.contains('former student'));
      });
    });
  }),
  //not really used other than to trigger other properties
  privileges: computed(
    'userIsCourseDirector',
    'userIsFaculty',
    'userIsDeveloper',
    'userIsFormerStudent',
    'userIsPublic',
    'userIsStudent',
  function(){
    Ember.RSVP.all([
      this.get('userIsCourseDirector'),
      this.get('userIsFaculty'),
      this.get('userIsDeveloper'),
      this.get('userIsFormerStudent'),
      this.get('userIsPublic'),
      this.get('userIsStudent'),
    ]).then(arr => {
      return arr;
    });
  }),
  //will be customizable
  preferredDashboard: 'dashboard.week',
  //Program
  canViewProgram: computed('model', function(){
    return false;
  }),
  canViewPrograms: false,
  canEditPrograms: false,
  programsPrivilegesObserver: on('init', observer('privileges',
    function(){
      Ember.RSVP.all([
        this.get('userIsCourseDirector'),
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        this.set('canViewPrograms', hasRole.contains(true));
        this.set('canEditPrograms', hasRole.contains(true));
      });
  })),
  //Course
  canViewCourse: computed('model', function(){
    return false;
  }),
  canViewCourses: false,
  canEditCourses: false,
  coursesPrivilegesObserver: on('init', observer('privileges',
    function(){
      Ember.RSVP.all([
        this.get('userIsCourseDirector'),
        this.get('userIsFaculty'),
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        this.set('canViewCourses', hasRole.contains(true));
        this.set('canEditCourses', hasRole.contains(true));
      });
  })),
  canViewInstructorGroups: false,
  canEditInstructorGroups: false,
  instructorGroupsPrivilegesObserver: on('init', observer('privileges',
    function(){
      Ember.RSVP.all([
        this.get('userIsCourseDirector'),
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        this.set('canViewInstructorGroups', hasRole.contains(true));
        this.set('canEditInstructorGroups', hasRole.contains(true));
      });
  })),
  //Instructor Group
  canViewInstructorGroup: computed('model', function(){
    return false;
  }),
  canViewLearnerGroups: false,
  canEditLearnerGroups: false,
  learnerGroupsPrivilegesObserver: on('init', observer('privileges',
    function(){
      Ember.RSVP.all([
        this.get('userIsCourseDirector'),
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        this.set('canViewLearnerGroups', hasRole.contains(true));
        this.set('canEditLearnerGroups', hasRole.contains(true));
      });
  })),
  //Learner Group
  canViewLearnerGroup: computed('model', function(){
    return false;
  }),
  //Curriculum Inventory
  canViewCurriculumInventory: computed('model', function(){
    return false;
  }),
  //Report
  canViewReport: computed('model', function(){
    return false;
  }),
  //Reports
  canViewReports: computed('model', function(){
    return false;
  }),
  canViewAdminDashboard: false,
  canViewAdminDashboardObserver: on('init', observer('privileges',
    function(){
      Ember.RSVP.all([
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        this.set('canViewAdminDashboard', hasRole.contains(true));
      });
  })),
  relatedCourses: computed('model', function(){
    let defer = RSVP.defer();
    this.get('model').then( user => {
      if(isEmpty(user)){
        defer.resolve([]);
        return;
      }
      this.get('store').query('course', {
        filters: {
          users: [user.get('id')]
        }
      }).then(filteredCourses => {
        defer.resolve(filteredCourses);
      });
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  })
});
