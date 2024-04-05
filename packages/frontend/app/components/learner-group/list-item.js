import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { all, filter } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';

export default class LearnerGroupListItemComponent extends Component {
  @service permissionChecker;
  @tracked showRemoveConfirmation = false;
  @tracked showCopyConfirmation = false;

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(
      this.permissionChecker.canDeleteLearnerGroup(this.args.learnerGroup),
    );
  }

  @cached
  get canCreateData() {
    return new TrackedAsyncData(
      this.school ? this.permissionChecker.canCreateLearnerGroup(this.school) : false,
    );
  }

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

  @cached
  get isLinked() {
    return this.isLinkedData.isResolved ? this.isLinkedData.value : null;
  }

  get canDelete() {
    if (this.isLinked) {
      return false;
    }
    return this.canDeleteData.isResolved ? this.canDeleteData.value && !this.isLinked : false;
  }

  get canCreate() {
    return this.canCreateData.isResolved ? this.canCreateData.value && this.school : false;
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

  remove = dropTask(async () => {
    const descendants = await this.args.learnerGroup.allDescendants;
    await all([
      ...descendants.map((descendant) => descendant.destroyRecord()),
      this.args.learnerGroup.destroyRecord(),
    ]);
  });

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
