import Ember from 'ember';
import moment from 'moment';
import jwtDecode from 'jwt-decode';

const { computed, observer, RSVP, isEmpty, inject, get, Service, A } = Ember;
const { service } = inject;
const { all, map, Promise } = RSVP;

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

  /**
   * Observes available cohorts and sets the current cohort property to NULL if it is not included in that list.
   * @property availableCohortsObserver
   * @type {Ember.observer}
   */
  availableCohortsObserver: observer('availableCohorts.[]', async function(){
    const cohorts = await this.get('availableCohorts');
    if(!cohorts.includes(this.get('currentCohort'))){
      this.set('currentCohort', null);
    }
  }),

  currentCohort: null,

  /**
   * A list of all cohorts in the current school.
   * @property availableCohorts
   * @type {Ember.computed}
   * @public
   */
  availableCohorts: computed('currentSchool', async function(){
    const school = await this.get('currentSchool');
    const programs = await school.get('programs');
    let programYears = await all(programs.toArray().mapBy('programsYears'));
    programYears = programYears.reduce((array, set) => {
      return array.pushObjects(set.toArray());
    }, []).uniq();
    return await all(programYears.mapBy('cohort'));
  }),

  /**
   * All cohorts from all schools that the current user is associated with,
   * via primary school association and the explicit schools permissions.
   * @property cohortsInAllAssociatedSchools
   * @type {Ember.computed}
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
        return await program.get('cohorts');
      });
      return schoolCohorts.reduce((array, set) => {
        return array.pushObjects(set.toArray());
      }, []);
    });

    return cohorts.reduce((array, set) => {
      return array.pushObjects(set.toArray());
    }, []);
  }).readOnly(),

  userRoleTitles: computed('model.roles.[]', async function(){
    const user = await this.get('model');
    if(!user) {
      return [];
    }
    const roles = await user.get('roles');
    return roles.map(role => role.get('title').toLowerCase());
  }),

  userIsCourseDirector: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('course director');
  }),

  userIsFaculty: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('faculty');
  }),

  userIsDeveloper: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('developer');

  }),
  userIsStudent: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('student');
  }),
  userIsPublic: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('public');
  }),
  userIsFormerStudent: computed('useRoleTitles.[]', async function(){
    const roleTitles = await this.get('userRoleTitles');
    return roleTitles.includes('former student');
  }),
  activeRelatedCoursesInThisYearAndLastYear: computed(
    'model',
    'model.instructedOfferings.[]',
    'model.instructorGroups.[]',
    'model.instructedLearnerGroups.[]',
    'model.directedCourses.[]',
    'model.instructorIlmSessions.[]',
    async function(){
      const user = await this.get('model');
      if(isEmpty(user)){
        return [];
      }
      let currentYear = moment().format('YYYY');
      const currentMonth = parseInt(moment().format('M'));
      if(currentMonth < 6){
        currentYear--;
      }
      const previousYear = currentYear -1;
      const nextYear = currentYear +1;
      return await this.get('store').query('course', {
        my: true,
        filters: {
          year: [previousYear, currentYear, nextYear],
          locked: false,
          archived: false
        }
      });
    }
  )
});
