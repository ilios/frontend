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
