import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class UserGuideLinkComponent extends Component {
  @action
  openUserGuide() {
    window.open('https://iliosproject.gitbook.io/ilios-user-guide', '_blank');
  }
}
