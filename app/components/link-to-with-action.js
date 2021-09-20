import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class LinkToWithActionComponent extends Component {
  @service router;

  get href() {
    return this.router.urlFor(this.args.route, {
      queryParams: this.queryParams,
    });
  }

  get isActive() {
    return this.router.isActive(this.args.route);
  }

  get queryParams() {
    return this.args.queryParams ?? {};
  }

  @action
  navigate(evt) {
    evt.preventDefault();
    this.args.action();
    this.router.transitionTo(this.args.route, {
      queryParams: this.queryParams,
    });
  }
}
