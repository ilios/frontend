import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class ErrorController extends Controller {
  @action
  forceRefresh() {
    location.reload();
  }

  get isA404() {
    if (this.model?.errors?.length > 0) {
      return Number(this.model.errors[0].status) === 404;
    }

    return false;
  }
}
