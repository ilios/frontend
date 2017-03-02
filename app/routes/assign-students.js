import Ember from 'ember';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

const { inject, Route } = Ember;
const { service } = inject;

export default Route.extend(AuthenticatedRouteMixin, {
  currentUser: service(),
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
