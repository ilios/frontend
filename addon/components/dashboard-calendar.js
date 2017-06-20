import Ember from 'ember';
import layout from '../templates/components/dashboard-calendar';
import moment from 'moment';
import momentFormat from 'ember-moment/computeds/format';

const { Component, computed, isPresent, RSVP, Object:EmberObject, inject, isEmpty } = Ember;
const { service } = inject;
const { all, map, Promise } = RSVP;

export default Component.extend({
  layout,
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
  classNames: ['dashboard-calendar'],
  activeFilters: null,
  schoolPickedByUser: null,
  selectedDate: null,
  selectedView: null,
  selectedCohorts: null,
  selectedCourseLevels: null,
  selectedCourses: null,
  selectedSessionTypes: null,

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
   * @property academicYears
   * @type {Ember.computed}
   * @public
   */
  academicYears: computed('allAcademicYears.[]', 'academicYearSelectedByUser', function(){
    return new Promise(resolve => {
      this.get('allAcademicYears').then(years => {
        resolve(years.sortBy('title'));
      });
    });
  }),

  /**
   * @property cohorts
   * @type {Ember.computed}
   * @public
   */
  cohorts: computed('selectedSchool', 'selectedAcademicYear', async function(){
    const school = await this.get('selectedSchool');
    const year = await this.get('selectedAcademicYear');
    const cohorts = await school.getCohortsForYear(year.get('title'));
    const cohortProxies = await map(cohorts.toArray(), async cohort => {
      let displayTitle = cohort.get('title');
      if (isEmpty(displayTitle)) {
        const i18n = this.get('i18n');
        const classOfYear = await cohort.get('classOfYear');

        displayTitle = i18n.t('general.classOf', {year: classOfYear});
      }

      return EmberObject.create({
        cohort,
        displayTitle
      });
    });

    const sortedProxies = cohortProxies.sortBy('displayTitle');
    const sortedCohorts = sortedProxies.mapBy('cohort');

    return sortedCohorts;
  }),

  /**
   * @property courseLevels
   * @type {Array}
   * @public
   */
  courseLevels: [1, 2, 3, 4, 5],

  /**
   * @property courses
   * @type {Ember.computed}
   * @public
   */
  courses: computed('selectedSchool', 'selectedAcademicYear', function(){
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
   * @property filterTags
   * @type {Ember.computed}
   * @public
   */
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
            hash.name = new Promise(resolve => {
              resolve(filter.get('title'));
            });
            break;
          case 'cohort':
            hash.class = 'tag-cohort';
            hash.name = new Promise(resolve => {
              let displayTitle = filter.get('title');
              const i18n = this.get('i18n');
              filter.get('classOfYear').then(classOfYear => {
                if (isEmpty(displayTitle)) {
                  displayTitle = i18n.t('general.classOf', {year: classOfYear});
                }
                filter.get('programYear.program').then(program => {
                  resolve(`${displayTitle} ${program.get('title')}`);
                });
              });
            });
            break;
          case 'course':
            hash.class = 'tag-course';
            hash.name = new Promise(resolve => {
              resolve(filter.get('title'));
            });
            break;
          }
        }
        return hash;
      });
    }
  }),

  hasMoreThanOneSchool: computed('schools.[]', function() {
    return this.get('schools').then(schools => {
      return (schools.length > 1);
    });
  }),

  /**
   * @property selectedSchool
   * @type {Ember.computed}
   * @public
   */
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

  /**
   * @property schools
   * @type {Ember.computed}
   * @public
   */
  schools: computed('allSchools.[]', 'selectedSchool', function(){
    return new Promise(resolve => {
      this.get('allSchools').then(schools => {
        resolve(schools.sortBy('title'));
      });
    });
  }),

  /**
   * @property selectedAcademicYear
   * @type {Ember.computed}
   * @public
   */
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

  /**
   * @property sessionTypes
   * @type {Ember.computed}
   * @public
   */
  sessionTypes: computed('selectedSchool.sessionTypes.[]', 'selectedSessionTypes.[]', function(){
    return new Promise(resolve => {
      this.get('selectedSchool').then(school => {
        school.get('sessionTypes').then(types => {
          resolve(types.sortBy('title'));
        });
      });
    });
  }),

  /**
   * @property showClearFilters
   * @type {Ember.computed}
   * @public
   */
  showClearFilters: computed('selectedCourses.[]', 'selectedSessionTypes.[]', 'selectedCourseLevels.[]', 'selectedCohorts.[]', {
    get() {
      const a = this.get('selectedSessionTypes');
      const b = this.get('selectedCourseLevels');
      const c = this.get('selectedCohorts');
      const d = this.get('selectedCourses');

      let results = a.concat(b, c, d);
      this.set('activeFilters', results);

      return isPresent(results);
    }
  }).readOnly(),

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

  /**
   * @property allSchools
   * @type {Ember.computed}
   * @protected
   */
  allSchools: computed(function(){
    return new Promise(resolve => {
      this.get('currentUser.model').then(user => {
        user.get('schools').then(schools => {
          resolve(schools);
        });
      });
    });
  }),

  /**
   * @property allAcademicYears
   * @type {Ember.computed}
   * @protected
   */
  allAcademicYears: computed(function(){
    return this.get('store').findAll('academic-year');
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
