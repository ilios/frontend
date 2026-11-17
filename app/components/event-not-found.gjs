import { LinkTo } from '@ember/routing';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';

export default class EventNotFoundComponent extends Component {
  @service router;

  get showLink() {
    try {
      return Boolean(this.router.urlFor('dashboard'));
    } catch {
      return false;
    }
  }
  <template>
    <div class="event-not-found main-section" data-test-event-not-found>
      <h2 data-test-title>{{t "general.eventNotFoundTitle"}}</h2>
      <p data-test-explanation>{{t "general.eventNotFoundExplanation"}}</p>
      {{#if this.showLink}}
        <LinkTo @route="dashboard" data-test-back-to-dashboard>
          {{t "general.backToDashboard"}}
        </LinkTo>
      {{/if}}
    </div>
  </template>
}
