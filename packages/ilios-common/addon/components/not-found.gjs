import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class NotFoundComponent extends Component {
  @service router;

  get showLink() {
    try {
      return Boolean(this.router.urlFor('dashboard'));
    } catch {
      return false;
    }
  }
}

<p data-test-not-found>
  {{t "general.notFoundMessage"}}
  <br />
  {{#if this.showLink}}
    <LinkTo @route="dashboard" data-test-back-to-dashboard>
      {{t "general.backToDashboard"}}
    </LinkTo>
  {{/if}}
</p>