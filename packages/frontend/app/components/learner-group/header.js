import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class LearnerGroupHeaderComponent extends Component {
  @tracked @NotBlank() @Length(3, 60) title;

  constructor() {
    super(...arguments);
    this.title = this.args.learnerGroup.title;
  }

  @cached
  get upstreamRelationshipsData() {
    return new TrackedAsyncData(this.resolveUpstreamRelationships(this.args.learnerGroup));
  }

  get upstreamRelationships() {
    return this.upstreamRelationshipsData.isResolved ? this.upstreamRelationshipsData.value : null;
  }

  get programYear() {
    return this.upstreamRelationships?.programYear;
  }

  get program() {
    return this.upstreamRelationships?.program;
  }

  get school() {
    return this.upstreamRelationships?.school;
  }

  get usersOnlyAtThisLevel() {
    return this.args.learnerGroup.usersOnlyAtThisLevel
      ? this.args.learnerGroup.usersOnlyAtThisLevel
      : [];
  }

  async resolveUpstreamRelationships(learnerGroup) {
    const cohort = await learnerGroup.cohort;
    const programYear = await cohort.programYear;
    const program = await programYear.program;
    const school = await program.school;

    return { cohort, programYear, program, school };
  }

  @action
  revertTitleChanges() {
    this.title = this.args.learnerGroup.title;
  }

  changeTitle = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.learnerGroup.title = this.title;
    await this.args.learnerGroup.save();
  });
}
