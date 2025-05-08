import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class UserProfileLearnerGroupComponent extends Component {
  @cached
  get upstreamRelatedData() {
    return new TrackedAsyncData(this.resolveUpstream(this.args.learnerGroup));
  }

  get upstreamRelated() {
    return this.upstreamRelatedData.isResolved ? this.upstreamRelatedData.value : null;
  }

  get schoolTitle() {
    return this.upstreamRelated?.school.title ?? '';
  }

  get programTitle() {
    return this.upstreamRelated?.program.title ?? '';
  }

  get cohortTitle() {
    return this.upstreamRelated?.cohort.title ?? '';
  }

  async resolveUpstream(learnerGroup) {
    const cohort = await learnerGroup.cohort;
    const programYear = await cohort.programYear;
    const program = await programYear.program;
    const school = await program.school;

    return { cohort, program, school };
  }
}
