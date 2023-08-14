import { service } from '@ember/service';
import Route from '@ember/routing/route';

class MissingUserEvent {
  slug = null;

  constructor(slug) {
    this.slug = slug;
  }
}

export default class EventsRoute extends Route {
  @service userEvents;
  @service schoolEvents;
  @service session;
  @service router;

  async model(params) {
    const slug = params.slug;
    const container = slug.substring(0, 1);
    let eventService;
    if (container === 'S') {
      eventService = this.schoolEvents;
    }
    if (container === 'U') {
      eventService = this.userEvents;
    }

    const event = await eventService.getEventForSlug(slug);
    if (!event && 'U' === container) {
      return new MissingUserEvent(slug);
    }
    return event;
  }

  beforeModel(transition) {
    this.session.requireAuthentication(transition, 'login');
  }

  afterModel(model) {
    if (model instanceof MissingUserEvent) {
      this.router.transitionTo('missing-user-event', model);
    }
  }
}
