import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';

export default class SessionsGridRowComponent extends Component {
  @service permissionChecker;

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(this.permissionChecker.canDeleteSession(this.args.session));
  }

  get canDelete() {
    return this.canDeleteData.isResolved ? this.canDeleteData.value : false;
  }

  @cached
  get canUpdateData() {
    return new TrackedAsyncData(this.permissionChecker.canUpdateSession(this.args.session));
  }

  get canUpdate() {
    return this.canUpdateData.isResolved ? this.canUpdateData.value : false;
  }
}
