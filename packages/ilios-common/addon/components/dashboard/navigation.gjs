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
