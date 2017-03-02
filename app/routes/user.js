import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route, RSVP } = Ember;
const { Promise, hash, all } = RSVP;

export default Route.extend(AuthenticatedRouteMixin, {
  titleToken: 'general.admin',
  /**
  * Prefetch user relationship data to smooth loading
  **/
  afterModel(user){
    return new Promise(resolve => {
      hash({
        cohorts: user.get('cohorts'),
        learnerGroups: user.get('learnerGroups'),
        roles: user.get('roles'),
        schools: user.get('schools'),
      }).then(obj => {
        all([all(obj.cohorts.mapBy('school')), all(obj.learnerGroups.mapBy('school'))]).then( ()=>{
          resolve();
        });
      });
    });

  }
});
