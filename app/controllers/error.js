import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ErrorController extends Controller {
  @action
  forceRefresh() {
    location.reload();
  }
}
