import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default class EventsRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service userEvents;
  @service schoolEvents;

  model(params) {
    const slug = params.slug;
    const container = slug.substring(0, 1);
    let eventService;
    if(container === 'S'){
      eventService = this.schoolEvents;
    }
    if(container === 'U'){
      eventService = this.userEvents;
    }

    return eventService.getEventForSlug(slug);
  }
}
