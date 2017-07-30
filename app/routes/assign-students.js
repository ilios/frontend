import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { Route } = Ember;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: Ember.inject.service(),
  titleToken: 'general.admin',
  model(){
    return this.get('currentUser.model').then(user => {
      return user.get('schools').then(schools => {
        return user.get('school').then(primarySchool => {
          return {
            primarySchool,
            schools
          };
        });
      });
    });
  },
  queryParams: {
    filter: {
      replace: true
    }
  }
});
