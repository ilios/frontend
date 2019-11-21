import { inject as service } from '@ember/service';
import Component from '@glimmer/component';

export default class BackLink extends Component {
  @service intl;
  back() {
    window.history.back();
  }
}
