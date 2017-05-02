import Ember from 'ember';
import moment from 'moment';

const { computed, observer, on, RSVP, isEmpty, inject, get, $, Service, A } = Ember;
const { service } = inject;
const { all, hash, Promise } = RSVP;

export default Service.extend({
  store: service(),
  session: service(),
  currentUserId: computed('session.data.authenticated.jwt', function(){
    const session = this.get('session');
    if(isEmpty(session)){
      return null;
    }

    const jwt = session.get('data.authenticated.jwt');

    if(isEmpty(jwt)){
      return null;
    }
    const js = atob(jwt.split('.')[1]);
    const obj = $.parseJSON(js);

    return get(obj, 'user_id');
  }),

  model: computed('currentUserId', function(){
    return new Promise(resolve => {
      let currentUserId = this.get('currentUserId');
      if (!currentUserId) {
        resolve(null);
      } else {
        this.get('store').find('user', currentUserId).then((user) => {
          resolve(user);
        });
      }
    });
  }),

  availableCohortsObserver: observer('availableCohorts.[]', function(){
    this.get('availableCohorts').then(cohorts => {
      if(!cohorts.includes(this.get('currentCohort'))){
        this.set('currentCohort', null);
      }
    });
  }),
  currentCohort: null,
  availableCohorts: computed('currentSchool', function(){
    return new Promise(resolve => {
      this.get('currentSchool').then(school => {
        school.get('programs').then(programs => {
          let promises = programs.map(program => {
            return program.get('programYears');
          });
          hash(promises).then(obj => {
            let promises2 = [];
            Object.keys(obj).forEach(key => {
              obj[key].forEach(programYear => {
                promises2.push(programYear.get('cohort'));
              });
            });
            hash(promises2).then(obj2 => {
              let cohorts = A();
              Object.keys(obj2).forEach(key => {
                cohorts.pushObject(obj2[key]);
              });
              resolve(cohorts);
            });
          });
        });
      });
    });
  }),

  /**
   * All cohorts from all schools that the current user is associated with,
   * via primary school association and the explicit schools permissions.
   * @property availableCohortsForAllSchools
   * @type Ember.computed
   * @readOnly
   * @public
   */
  cohortsInAllAssociatedSchools: computed('model.schools.[]', {
    get() {
      return new Promise(resolve => {
        this.get('model').then(user => {
          user.get('schools').then(schools => {
            all(schools.mapBy('programs')).then(programsArrays => {
              let programs = [];
              programsArrays.forEach(arr => {
                arr.forEach(program => {
                  programs.push(program);
                });
              });
              all(programs.mapBy('programYears')).then(programYearsArrays => {
                let programYears = [];
                programYearsArrays.forEach(arr => {
                  arr.forEach(programYear => {
                    programYears.push(programYear);
                  });
                });
                all(programYears.mapBy('cohort')).then(cohorts => {
                  resolve(cohorts);
                });
              });
            });
          });
        });
      });
    }
  }).readOnly(),

  userRoleTitles: computed('model.roles.[]', function(){
    return new Promise((resolve) => {
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
    return new Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.includes('course director'));
      });
    });
  }),
  userIsFaculty: computed('useRoleTitles.[]', function(){
    return new Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.includes('faculty'));
      });
    });
  }),
  userIsDeveloper: computed('useRoleTitles.[]', function(){
    return new Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.includes('developer'));
      });
    });
  }),
  userIsStudent: computed('useRoleTitles.[]', function(){
    return new Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.includes('student'));
      });
    });
  }),
  userIsPublic: computed('useRoleTitles.[]', function(){
    return new Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.includes('public'));
      });
    });
  }),
  userIsFormerStudent: computed('useRoleTitles.[]', function(){
    return new Promise((resolve) => {
      this.get('userRoleTitles').then(roleTitles => {
        resolve(roleTitles.includes('former student'));
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
    all([
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
  //School
  canViewSchool: computed('model', function(){
    return false;
  }),
  canViewSchools: false,
  canEditSchools: false,
  schoolsPrivilegesObserver: on('init', observer('privileges',
    function(){
      all([
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        if ( !(this.get('isDestroyed') || this.get('isDestroying')) ) {
          this.set('canViewSchools', hasRole.includes(true));
          this.set('canEditSchools', hasRole.includes(true));
        }
      });
    }
  )),
  //Program
  canViewProgram: computed('model', function(){
    return false;
  }),
  canViewPrograms: false,
  canEditPrograms: false,
  programsPrivilegesObserver: on('init', observer('privileges',
    function(){
      all([
        this.get('userIsCourseDirector'),
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        if ( !(this.get('isDestroyed') || this.get('isDestroying')) ) {
          this.set('canViewPrograms', hasRole.includes(true));
          this.set('canEditPrograms', hasRole.includes(true));
        }
      });
    }
  )),
  //Course
  canViewCourse: computed('model', function(){
    return false;
  }),
  canViewCourses: false,
  canEditCourses: false,
  canPrintUnpublishedCourse: false,
  coursesPrivilegesObserver: on('init', observer('privileges',
    function(){
      all([
        this.get('userIsCourseDirector'),
        this.get('userIsFaculty'),
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        if ( !(this.get('isDestroyed') || this.get('isDestroying')) ) {
          this.set('canViewCourses', hasRole.includes(true));
          this.set('canEditCourses', hasRole.includes(true));
          this.set('canPrintUnpublishedCourse', hasRole.includes(true));
        }
      });
    }
  )),
  canViewInstructorGroups: false,
  canEditInstructorGroups: false,
  instructorGroupsPrivilegesObserver: on('init', observer('privileges',
    function(){
      all([
        this.get('userIsCourseDirector'),
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        if ( !(this.get('isDestroyed') || this.get('isDestroying')) ) {
          this.set('canViewInstructorGroups', hasRole.includes(true));
          this.set('canEditInstructorGroups', hasRole.includes(true));
        }
      });
    }
  )),
  //Instructor Group
  canViewInstructorGroup: computed('model', function(){
    return false;
  }),
  canViewLearnerGroups: false,
  canEditLearnerGroups: false,
  learnerGroupsPrivilegesObserver: on('init', observer('privileges',
    function(){
      all([
        this.get('userIsCourseDirector'),
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        if ( !(this.get('isDestroyed') || this.get('isDestroying')) ) {
          this.set('canViewLearnerGroups', hasRole.includes(true));
          this.set('canEditLearnerGroups', hasRole.includes(true));
        }
      });
    }
  )),
  //Learner Group
  canViewLearnerGroup: computed('model', function(){
    return false;
  }),

  //Curriculum Inventory
  canViewCurriculumInventory: false,
  canViewCurriculumInventoryObserver: on('init', observer('privileges',
    function(){
      all([
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        if ( !(this.get('isDestroyed') || this.get('isDestroying')) ) {
          this.set('canViewCurriculumInventory', hasRole.includes(true));
        }
      });
    }
  )),
  canEditCurriculumInventory: false,
  canEditCurriculumInventoryObserver: on('init', observer('privileges',
    function(){
      all([
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        if ( !(this.get('isDestroyed') || this.get('isDestroying')) ) {
          this.set('canEditCurriculumInventory', hasRole.includes(true));
        }
      });
    }
  )),

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
      all([
        this.get('userIsDeveloper')
      ]).then(hasRole => {
        if ( !(this.get('isDestroyed') || this.get('isDestroying')) ) {
          this.set('canViewAdminDashboard', hasRole.includes(true));
        }
      });
    }
  )),
  activeRelatedCoursesInThisYearAndLastYear: computed(
    'model',
    'model.instructedOfferings.[]',
    'model.instructorGroups.[]',
    'model.instructedLearnerGroups.[]',
    'model.directedCourses.[]',
    'model.instructorIlmSessions.[]',
    function(){
      return new Promise(resolve => {
        this.get('model').then(user => {
          if(isEmpty(user)){
            resolve([]);
            return;
          }
          let currentYear = moment().format('YYYY');
          const currentMonth = parseInt(moment().format('M'));
          if(currentMonth < 6){
            currentYear--;
          }
          const previousYear = currentYear -1;
          const nextYear = currentYear +1;
          this.get('store').query('course', {
            my: true,
            filters: {
              year: [previousYear, currentYear, nextYear],
              locked: false,
              archived: false
            }
          }).then(filteredCourses => {
            resolve(filteredCourses);
          });
        });
      });
    }
  )
});
