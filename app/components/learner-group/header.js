import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

@validatable
export default class LearnerGroupHeaderComponent extends Component {
  @tracked @NotBlank() @Length(3, 60) title;

  @cached
  get cohortData() {
    return new TrackedAsyncData(this.args.learnerGroup.cohort);
  }

  get cohort() {
    return this.cohortData.isResolved ? this.cohortData.value : null;
  }

  @cached
  get programYearData() {
    return new TrackedAsyncData(this.cohort?.programYear);
  }

  get programYear() {
    return this.programYearData.isResolved ? this.programYearData.value : null;
  }

  @cached
  get programData() {
    return new TrackedAsyncData(this.programYear?.program);
  }

  get program() {
    return this.programData.isResolved ? this.programData.value : null;
  }

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.program?.school);
  }

  get school() {
    return this.schoolData.isResolved ? this.schoolData.value : null;
  }

  get usersOnlyAtThisLevel() {
    return this.args.learnerGroup.usersOnlyAtThisLevel
      ? this.args.learnerGroup.usersOnlyAtThisLevel
      : [];
  }

  @action
  load() {
    this.title = this.args.learnerGroup.title;
  }

  @action
  revertTitleChanges() {
    this.title = this.args.learnerGroup.title;
  }

  @dropTask
  *changeTitle() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.learnerGroup.title = this.title;
    yield this.args.learnerGroup.save();
  }
}
