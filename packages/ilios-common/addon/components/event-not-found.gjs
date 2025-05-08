import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class EventNotFoundComponent extends Component {
  @service router;

  get showLink() {
    try {
      return Boolean(this.router.urlFor('dashboard'));
    } catch {
      return false;
    }
  }
}

<div class="event-not-found" data-test-event-not-found>
  <h2 data-test-title>{{t "general.eventNotFoundTitle"}}</h2>
  <p data-test-explanation>{{t "general.eventNotFoundExplanation"}}</p>
  {{#if this.showLink}}
    <LinkTo @route="dashboard" data-test-back-to-dashboard>
      {{t "general.backToDashboard"}}
    </LinkTo>
  {{/if}}
</div>