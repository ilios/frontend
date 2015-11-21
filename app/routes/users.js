import Ember from 'ember';

const { inject, Route, run } = Ember;
const { service } = inject;
const { once } = run;

export default Route.extend({
  currentUser: service(),

  queryParams: {
    page: {
      refreshModel: true
    }
  },

  model(params) {
    // Next two lines should be removed after user session re-write
    return this.get('currentUser.model').then((user) => {
      return user.get('school').then((userSchool) => {
        const school = userSchool.get('id');
        const limit = 21;
        const offset = (limit - 1) * (params.page - 1);

        return this.store.query('user', {
          school, limit, offset,
          'order_by[lastName]': 'ASC',
          'order_by[firstName]': 'ASC'
        }).then((users) => {
          return users.toArray();
        });
      });
    });
  },

  actions: {
    // Workaround for Ember bug #5566
    queryParamsDidChange() {
      once(this, this.refresh);
    }
  }
});
