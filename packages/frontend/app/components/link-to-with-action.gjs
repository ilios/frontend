import Component from '@glimmer/component';
import { service } from '@ember/service';
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

<a
  href={{this.href}}
  class={{if this.isActive "active"}}
  {{on "click" this.navigate}}
  data-test-link-to-with-action
>
  {{yield}}
</a>