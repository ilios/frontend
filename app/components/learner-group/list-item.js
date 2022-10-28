import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { isNone } from '@ember/utils';
import { use } from 'ember-could-get-used-to-this';
import { dropTask } from 'ember-concurrency';
import { all, filter } from 'rsvp';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import PermissionChecker from 'ilios/classes/permission-checker';

export default class LearnerGroupListItemComponent extends Component {
  @tracked showRemoveConfirmation = false;
  @tracked showCopyConfirmation = false;

  @use school = new ResolveAsyncValue(() => [
    this.args.learnerGroup.get('cohort.programYear.program.school'),
  ]);
  @use canDeletePermission = new PermissionChecker(() => [
    'canDeleteLearnerGroup',
    this.args.learnerGroup,
  ]);
  @use hasLearnersInGroupOrSubgroups = new ResolveAsyncValue(() => [
    this.args.learnerGroup.hasLearnersInGroupOrSubgroups,
    true,
  ]);
  @use canCreatePermission = new PermissionChecker(() => ['canCreateLearnerGroup', this.school]);
  @use isLinked = new ResolveAsyncValue(() => [
    this.isLinkedToOfferingsOrIlms(this.args.learnerGroup),
  ]);

  get canDelete() {
    if (isNone(this.isLinked)) {
      return false;
    }
    return this.canDeletePermission && !this.isLinked;
  }

  get canCreate() {
    return this.school && this.canCreatePermission;
  }

  async isLinkedToOfferingsOrIlms(learnerGroup) {
    const offerings = (await learnerGroup.offerings).slice();
    if (offerings.length) {
      return true;
    }
    const ilms = (await learnerGroup.ilmSessions).slice();
    if (ilms.length) {
      return true;
    }
    const children = (await learnerGroup.children).slice();
    const linkedChildren = await filter(children, async (child) => {
      return this.isLinkedToOfferingsOrIlms(child);
    });
    return !!linkedChildren.length;
  }

  @dropTask
  *remove() {
    const descendants = yield this.args.learnerGroup.allDescendants;
    yield all([
      ...descendants.map((descendant) => descendant.destroyRecord()),
      this.args.learnerGroup.destroyRecord(),
    ]);
  }

  @action
  copyWithLearners() {
    this.args.copyGroup(true, this.args.learnerGroup);
  }

  @action
  copyWithoutLearners() {
    this.args.copyGroup(false, this.args.learnerGroup);
  }

  @action
  showCopy() {
    this.showCopyConfirmation = true;
    this.showRemoveConfirmation = false;
  }

  @action
  showRemove() {
    this.showRemoveConfirmation = true;
    this.showCopyConfirmation = false;
  }
}
