import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ErrorDisplayComponent extends Component {
  @tracked isOffline = !navigator.onLine;
  @tracked showDetails = true;
  now = new Date();

  get is404() {
    return this.args.errors?.firstObject?.statusCode === '404';
  }
  refresh() {
    window.location.reload();
  }
}
