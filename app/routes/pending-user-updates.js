import Ember from 'ember';

export default Ember.Route.extend({
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
