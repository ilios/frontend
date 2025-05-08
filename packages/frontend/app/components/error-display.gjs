import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ErrorDisplayComponent extends Component {
  @tracked isOffline = !navigator.onLine;
  @tracked showDetails = true;
  now = new Date();

  get is404() {
    if (this.args.errors.length) {
      return this.args.errors[0].statusCode === '404';
    }
    return false;
  }
  refresh() {
    window.location.reload();
  }
}
