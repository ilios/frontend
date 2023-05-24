import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { use } from 'ember-could-get-used-to-this';
import { dropTask } from 'ember-concurrency';
import { all, filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import PermissionChecker from 'ilios/classes/permission-checker';

export default class LearnerGroupListItemComponent extends Component {
  @tracked showRemoveConfirmation = false;
  @tracked showCopyConfirmation = false;

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.getSchool(this.args.learnerGroup));
  }

  @cached
  get isLinkedData() {
    return new TrackedAsyncData(this.isLinkedToOfferingsOrIlms(this.args.learnerGroup));
  }

  get school() {
    return this.schoolData.isResolved ? this.schoolData.value : null;
  }

  @use canDeletePermission = new PermissionChecker(() => [
    'canDeleteLearnerGroup',
    this.args.learnerGroup,
  ]);

  @use canCreatePermission = new PermissionChecker(() => ['canCreateLearnerGroup', this.school]);

  @cached
  get isLinked() {
    return this.isLinkedData.isResolved ? this.isLinkedData.value : null;
  }

  get canDelete() {
    if (this.isLinked) {
      return false;
    }
    return this.canDeletePermission && !this.isLinked;
  }

  get canCreate() {
    return this.school && this.canCreatePermission;
  }

  async getSchool(learnerGroup) {
    const cohort = await learnerGroup.cohort;
    const programYear = await cohort.programYear;
    const program = await programYear.program;
    return program.school;
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
