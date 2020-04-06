import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class SessionRoute extends Route.extend(AuthenticatedRouteMixin) {
  async afterModel(model) {
    const course = await model.course;
    await this.store.query('session', { filters: { course: course.id } });
  }
}
