import Ember from 'ember';
import moment from 'moment';
import jwtDecode from '../utils/jwt-decode';

const { computed, RSVP, isEmpty, get, Service } = Ember;
const { map } = RSVP;

export default Service.extend({
  store: Ember.inject.service(),
  session: Ember.inject.service(),
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
        return array.pushObjects(set);
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
      const currentMonth = parseInt(moment().format('M'), 10);
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
