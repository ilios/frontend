import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class EventsRoute extends Route {
  @service userEvents;
  @service schoolEvents;
  @service session;

  model(params) {
    const slug = params.slug;
    const container = slug.substring(0, 1);
    let eventService;
    if (container === 'S') {
      eventService = this.schoolEvents;
    }
    if (container === 'U') {
      eventService = this.userEvents;
    }

    return eventService.getEventForSlug(slug);
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }
}
