import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class BackLinkComponent extends Component {
  @service intl;
  back(event) {
    event.preventDefault();
    window.history.back();
  }
}
