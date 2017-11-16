import Ember from 'ember';
import moment from 'moment';
import jwtDecode from 'jwt-decode';

const { computed, observer, RSVP, isEmpty, inject, get, Service, A } = Ember;
const { service } = inject;
const { hash, map, Promise } = RSVP;

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
    const obj = jwtDecode(jwt);

    return get(obj, 'user_id');
  }),

  model: computed('currentUserId', async function(){
    let currentUserId = this.get('currentUserId');
    if (!currentUserId) {
      return null;
    }
    return await this.get('store').find('user', currentUserId);
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
  cohortsInAllAssociatedSchools: computed('model.schools.[]', async function(){
    const user = await this.get('model');
    if (!user) {
      return [];
    }
    const schools = await user.get('schools');
    const cohorts = await map(schools, async school => {
      const programs = await school.get('programs');
      const schoolCohorts = await map(programs.toArray(), async program => {
        const programCohorts = await program.get('cohorts');

        return programCohorts;
      });
      let flatSchoolCohorts = schoolCohorts.reduce((array, set) => {
        return array.pushObjects(set.toArray());
      }, []);

      return flatSchoolCohorts;
    });

    let flatCohorts = cohorts.reduce((array, set) => {
      return array.pushObjects(set.toArray());
    }, []);

    return flatCohorts;
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
