import Ember from 'ember';

const { inject, Route } = Ember;
const { service } = inject;

export default Route.extend({
  currentUser: service(),

  model() {
    return this.get('currentUser.model').then((user) => {
      return user.get('school').then((userSchool) => {
        const school = userSchool.get('id');
        const limit = 21;

        return this.store.query('user', {
          school,
          limit,
          'order_by[lastName]': 'ASC'
        }).then((users) => {
          return users;
        });
      });
    });
  }
});
