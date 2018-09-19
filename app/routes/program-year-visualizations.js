import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import { all } from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {
  store: service(),
  titleToken: 'general.programs',

  /**
   * Prefetch related data to limit network requests
  */
  async afterModel(model) {
    const store = this.store;
    const cohort = await model.get('cohort');
    const courses = cohort.hasMany('courses').ids();

    let promises = [
      model.get('program'),
      model.get('competencies'),
      model.get('objectives'),
    ];
    if (courses.length) {
      promises.push(store.query('objective', { filters: { fullCourses: courses } }));
    }

    return all(promises);
  },
});
