import moment from 'moment';
import Ember from 'ember';
import DS from 'ember-data';
import momentFormat from 'ember-moment/computeds/format';

const { Component, computed, isPresent, RSVP, inject } = Ember;
const { service } = inject;
const { all, Promise } = RSVP;
const { PromiseArray } = DS;

export default Component.extend({
  init() {
    this._super(...arguments);
    //do these on setup otherwise tests were failing because
    //the old filter value hung around
    this.set('selectedSessionTypes', []);
    this.set('selectedCourseLevels', []);
    this.set('selectedCohorts', []);
    this.set('selectedCourses', []);
  },
  userEvents: service(),
  schoolEvents: service(),
  currentUser: service(),
  store: service(),
  i18n: service(),
  activeFilters: null,
  selectedDate: null,
  selectedView: null,
  selectedCohorts: [],
  selectedCourseLevels: [],
  selectedCourses: [],
  selectedSessionTypes: [],

  dueTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('general.dueThisDay');
  }),
  dayTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('general.day');
  }),
  weekTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('general.week');
  }),
  monthTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('general.month');
  }),
  loadingEventsTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('general.loadingEvents');
  }),
  icsInstructionsTranslation: computed('i18n.locale', function(){
    return this.get('i18n').t('general.icsInstructions');
  }),
  fromTimeStamp: computed('selectedDate', 'selectedView', function(){
    return moment(this.get('selectedDate')).startOf(this.get('selectedView')).subtract(this.get('skew'), 'days').unix();
  }),
  toTimeStamp: computed('selectedDate', 'selectedView', function(){
    return moment(this.get('selectedDate')).endOf(this.get('selectedView')).add(this.get('skew'), 'days').unix();
  }),
  clockSkew: computed('selectedView', function(){
    if(this.set('selectedView') === 'month'){
      return 6;
    }

    return 1;
  }),
  calendarDate: momentFormat('selectedDate', 'YYYY-MM-DD'),

  /**
   * @property courses
   * @type {Ember.computed}
   * @public
   */
  courses: computed('allCourses.[]', 'selectedCourses.[]', function(){
    return this.get('allCourses');
  }),

  /**
   * @property filteredEvents
   * @type {Ember.computed}
   * @public
   */
  filteredEvents: computed(
    'ourEvents.[]',
    'eventsWithSelectedSessionTypes.[]',
    'eventsWithSelectedCourseLevels.[]',
    'eventsWithSelectedCohorts.[]',
    'eventsWithSelectedCourses.[]',
    function() {
      return new Promise(resolve => {
        let promises = [];
        let eventTypes = [
          'eventsWithSelectedSessionTypes',
          'eventsWithSelectedCourseLevels',
          'eventsWithSelectedCohorts',
          'eventsWithSelectedCourses',
        ];
        let allFilteredEvents = [];
        eventTypes.forEach(name => {
          promises.pushObject(this.get(name).then(events => {
            allFilteredEvents.pushObject(events);
          }));
        });

        all(promises).then(()=> {
          this.get('ourEvents').then(events => {
            let filteredEvents = events.filter(event => {
              return allFilteredEvents.every(arr => {
                return arr.includes(event);
              });
            });
            resolve(filteredEvents);
          });
        });
      });
    }
  ),

  /**
   * @property ourEvents
   * @type {Ember.computed}
   * @protected
   */
  ourEvents: computed('mySchedule', 'fromTimeStamp', 'toTimeStamp', 'selectedSchool', 'selectedView', function(){
    return new Promise(resolve => {
      if(this.get('mySchedule')) {
        this.get('userEvents').getEvents(this.get('fromTimeStamp'), this.get('toTimeStamp')).then(userEvents => {
          resolve(userEvents);
        });
      } else {
        this.get('selectedSchool').then(school => {
          this.get('schoolEvents').getEvents(
            school.get('id'),
            this.get('fromTimeStamp'),
            this.get('toTimeStamp')
          ).then(schoolEvents => {
            resolve(schoolEvents);
          });
        });
      }
    });
  }),

  /**
   * @property eventsWithSelectedSessionTypes
   * @type {Ember.computed}
   * @protected
   */
  eventsWithSelectedSessionTypes: computed('ourEvents.[]', 'selectedSessionTypes.[]', function(){
    return new Promise(resolve => {
      this.get('ourEvents').then(events => {
        let selectedSessionTypes = this.get('selectedSessionTypes').mapBy('id');
        if(selectedSessionTypes.length === 0) {
          resolve(events);
          return;
        }
        let matchingEvents = [];
        let promises = [];
        events.forEach(event => {
          if (event.ilmSession || event.offering) {
            promises.pushObject(this.get('userEvents').getSessionTypeIdForEvent(event).then(id => {
              if (selectedSessionTypes.includes(id)) {
                matchingEvents.pushObject(event);
              }
            }));
          }
        });
        all(promises).then(()=> {
          resolve(matchingEvents);
        });
      });
    });
  }),

  /**
   * @property eventsWithSelectedCourseLevels
   * @type {Ember.computed}
   * @protected
   */
  eventsWithSelectedCourseLevels: computed('ourEvents.[]', 'selectedCourseLevels.[]', function(){
    return new Promise(resolve => {
      this.get('ourEvents').then(events => {
        let selectedCourseLevels = this.get('selectedCourseLevels');
        if(selectedCourseLevels.length === 0) {
          resolve(events);
          return;
        }
        let matchingEvents = [];
        let promises = [];
        events.forEach(event => {
          if (event.ilmSession || event.offering) {
            promises.pushObject(this.get('userEvents').getCourseLevelForEvent(event).then(level => {
              if (selectedCourseLevels.includes(level)) {
                matchingEvents.pushObject(event);
              }
            }));
          }
        });
        all(promises).then(()=> {
          resolve(matchingEvents);
        });
      });
    });
  }),

  /**
   * @property eventsWithSelectedCohorts
   * @type {Ember.computed}
   * @protected
   */
  eventsWithSelectedCohorts: computed('ourEvents.[]', 'selectedCohorts.[]', function(){
    return new Promise(resolve => {
      this.get('ourEvents').then(events => {
        let selectedCohorts = this.get('selectedCohorts').mapBy('id');
        if(selectedCohorts.length === 0) {
          resolve(events);
          return;
        }
        let matchingEvents = [];
        let promises = [];
        events.forEach(event => {
          if (event.ilmSession || event.offering) {
            promises.pushObject(this.get('userEvents').getCohortIdsForEvent(event).then(cohorts => {
              if (cohorts.any(cohortId => {
                return selectedCohorts.includes(cohortId);
              })) {
                matchingEvents.pushObject(event);
              }
            }));
          }
        });
        all(promises).then(()=> {
          resolve(matchingEvents);
        });
      });
    });
  }),

  /**
   * @property eventsWithSelectedCourses
   * @type {Ember.computed}
   * @protected
   */
  eventsWithSelectedCourses: computed('ourEvents.[]', 'selectedCourses.[]', function(){
    return new Promise(resolve => {
      let selectedCourses = this.get('selectedCourses').mapBy('id');
      this.get('ourEvents').then(events => {
        if(selectedCourses.length === 0) {
          resolve(events);
          return;
        }
        let matchingEvents = [];
        let promises = [];
        events.forEach(event => {
          if (event.ilmSession || event.offering) {
            promises.pushObject(this.get('userEvents').getCourseIdForEvent(event).then(courseId => {
              if (selectedCourses.includes(courseId)) {
                matchingEvents.pushObject(event);
              }
            }));
          }
        });
        all(promises).then(()=> {
          resolve(matchingEvents);
        });
      });
    });
  }),

  sessionTypes: computed('selectedSchool.sessionTypes.[]', 'selectedSessionTypes.[]', function(){
    return PromiseArray.create({
      promise: this.get('selectedSchool').then(school => {
        return school.get('sessionTypes').then( types => {
          return types.sortBy('title');
        });
      })
    });
  }),
  courseLevels: computed('selectedCourseLevels.[]', function(){
    let levels = [];
    for(let i =1; i <=5; i++){
      levels.pushObject(i);
    }

    return levels;
  }),
  allCohorts: computed('selectedSchool', 'selectedAcademicYear', function(){
    let defer = defer();
    this.get('selectedSchool').then(school => {
      this.get('selectedAcademicYear').then(year => {
        school.getCohortsForYear(year.get('title')).then(cohorts => {
          defer.resolve(cohorts.sortBy('displayTitle'));
        });
      });
    });
    return PromiseArray.create({
      promise: defer.promise
    });
  }),
  cohorts: computed('allCohorts.[].displayTitle', 'selectedCohorts.[]', function(){
    return this.get('allCohorts');
  }),

  /**
   * @property allCourses
   * @type {Ember.computed}
   * @protected
   */
  allCourses: computed('selectedSchool', 'selectedAcademicYear', function(){
    return new Promise(resolve => {
      this.get('selectedSchool').then((school) => {
        this.get('selectedAcademicYear').then((year) => {
          this.get('store').query('course', {
            filters: {
              school: school.get('id'),
              year: year.get('title')
            },
            limit: 1000
          }).then((courses) => {
            resolve(courses.sortBy('title'));
          });
        });
      });
    });
  }),

  selectedSchool: computed('schoolPickedByUser', 'currentUser.model.school', function(){
    const schoolPickedByUser = this.get('schoolPickedByUser');
    return new Promise(resolve => {
      if (schoolPickedByUser)  {
        resolve(schoolPickedByUser);
      } else {
        this.get('currentUser').get('model').then(user => {
          user.get('school').then(school => {
            resolve(school);
          });
        });
      }
    });
  }),
  hasMoreThanOneSchool: computed.gt('schools.length', 1),
  allSchools: computed(function(){
    return PromiseArray.create({
      promise: this.get('currentUser.model').then(user => {
        return user.get('schools').then(schools => {
          return schools;
        });
      })
    });
  }),
  schools: computed('allSchools.[]', 'selectedSchool', function(){
    return this.get('allSchools').sortBy('title');
  }),
  selectedAcademicYear: computed('academicYearSelectedByUser', 'allAcademicYears.[]', function(){
    const academicYearSelectedByUser = this.get('academicYearSelectedByUser');
    return new Promise(resolve => {
      if (academicYearSelectedByUser)  {
        resolve(academicYearSelectedByUser);
      } else {
        this.get('allAcademicYears').then(years => {
          const year = years.sortBy('title').get('lastObject');
          resolve(year);
        });
      }
    });
  }),
  allAcademicYears: computed(function(){
    return this.get('store').findAll('academic-year');
  }),
  academicYears: computed('allAcademicYears.[]', 'academicYearSelectedByUser', function(){
    return PromiseArray.create({
      promise: this.get('allAcademicYears').then(years => {
        return years.sortBy('title');
      })
    });
  }),

  showClearFilters: computed('selectedCourses.[]', 'selectedSessionTypes.[]', 'selectedCourseLevels.[]', 'selectedCohorts.[]', {
    get() {
      const a = this.get('selectedSessionTypes');
      const b = this.get('selectedCourseLevels');
      const c = this.get('selectedCohorts');
      const d = this.get('selectedCourses');

      let results = a.concat(b, c, d);
      this.set('activeFilters', results);

      return isPresent(results) ? true : false;
    }
  }).readOnly(),

  filterTags: computed('activeFilters', {
    get() {
      const activeFilters = this.get('activeFilters');

      return activeFilters.map((filter) => {
        let hash = {};
        hash.filter = filter;

        if (typeof filter === 'number') {
          hash.class = 'tag-course-level';
          hash.name = `Course Level ${filter}`;
        } else {
          let model = filter.get('constructor.modelName');

          switch (model) {
          case 'session-type':
            hash.class = 'tag-session-type';
            hash.name = filter.get('title');
            break;
          case 'cohort':
            hash.class = 'tag-cohort';
            hash.name = `${filter.get('displayTitle')} ${filter.get('programYear.program.title')}`;
            break;
          case 'course':
            hash.class = 'tag-course';
            hash.name = filter.get('title');
            break;
          }
        }

        return hash;
      });
    }
  }),

  actions: {
    toggleSessionType(sessionType){
      if(this.get('selectedSessionTypes').includes(sessionType)){
        this.get('selectedSessionTypes').removeObject(sessionType);
      } else {
        this.get('selectedSessionTypes').pushObject(sessionType);
      }
    },
    toggleCourseLevel(level){
      if(this.get('selectedCourseLevels').includes(level)){
        this.get('selectedCourseLevels').removeObject(level);
      } else {
        this.get('selectedCourseLevels').pushObject(level);
      }
    },
    toggleCohort(cohort){
      if(this.get('selectedCohorts').includes(cohort)){
        this.get('selectedCohorts').removeObject(cohort);
      } else {
        this.get('selectedCohorts').pushObject(cohort);
      }
    },
    toggleCourse(course){
      if(this.get('selectedCourses').includes(course)){
        this.get('selectedCourses').removeObject(course);
      } else {
        this.get('selectedCourses').pushObject(course);
      }
    },

    clearFilters() {
      const selectedCourses = [];
      const selectedSessionTypes = [];
      const selectedCourseLevels = [];
      const selectedCohorts = [];

      this.setProperties({ selectedCourses, selectedSessionTypes, selectedCourseLevels, selectedCohorts });
    },

    removeFilter(filter) {
      if (typeof filter === 'number') {
        this.send('toggleCourseLevel', filter);
      } else {
        let model = filter.get('constructor.modelName');

        switch (model) {
        case 'session-type':
          this.send('toggleSessionType', filter);
          break;
        case 'cohort':
          this.send('toggleCohort', filter);
          break;
        case 'course':
          this.send('toggleCourse', filter);
          break;
        }
      }
    }
  }
});
