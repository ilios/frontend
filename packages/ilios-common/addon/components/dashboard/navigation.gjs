import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';

export default class NavigationComponent extends Component {
  @service currentUser;
  @service iliosConfig;

  @tracked icsFeedUrl;
  @tracked icsInstructions;

  constructor() {
    super(...arguments);
    this.setup.perform();
  }

  setup = dropTask(async () => {
    const user = await this.currentUser.getModel();
    const icsFeedKey = user.icsFeedKey;
    const apiHost = this.iliosConfig.apiHost;
    const loc = window.location.protocol + '//' + window.location.hostname;
    const server = apiHost ? apiHost : loc;
    this.icsFeedUrl = server + '/ics/' + icsFeedKey;
    this.icsInstructions = 'Copy My ICS Link';
  });
}

<nav
  class="dashboard-navigation"
  data-test-dashboard-navigation
  aria-label={{t "general.dashboardNavigation"}}
  ...attributes
>
  <ul>
    <li>
      <LinkTo
        @route="dashboard.week"
        title={{t "general.weekAtAGlance"}}
        @current-when="dashboard.week"
        data-test-link-week
      >
        {{t "general.weekAtAGlance"}}
      </LinkTo>
    </li>
    <li>
      <LinkTo
        @route="dashboard.materials"
        title={{t "general.materials"}}
        @current-when="dashboard.materials"
        data-test-link-materials
      >
        {{t "general.materials"}}
      </LinkTo>
    </li>
    <li>
      <LinkTo
        @route="dashboard.calendar"
        title={{t "general.calendar"}}
        @current-when="dashboard.calendar"
        data-test-link-calendar
      >
        {{t "general.calendar"}}
      </LinkTo>
      <IcsFeed @url={{this.icsFeedUrl}} @instructions={{this.icsInstructions}} />
    </li>
  </ul>
</nav>