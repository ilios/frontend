import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { map, all } from 'rsvp';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailCohortsComponent extends Component {
  @tracked isManaging = false;
  @tracked bufferedCohorts = [];

  @cached
  get cohortsData() {
    return new TrackedAsyncData(this.args.course.cohorts);
  }

  get cohorts() {
    return this.cohortsData.isResolved ? this.cohortsData.value : null;
  }

  manage = dropTask(async () => {
    const cohorts = await this.args.course.cohorts;
    this.bufferedCohorts = [...cohorts];
    this.isManaging = true;
  });

  save = dropTask(async () => {
    const { course } = this.args;
    const cohortList = await course.cohorts;
    const removedCohorts = cohortList.filter((cohort) => {
      return !this.bufferedCohorts.includes(cohort);
    });
    if (removedCohorts.length) {
      const programYearsToRemove = await map(removedCohorts, async (cohort) => cohort.programYear);
      const objectives = await course.courseObjectives;
      await all(
        objectives.map((objective) => objective.removeParentWithProgramYears(programYearsToRemove)),
      );
    }
    course.set('cohorts', this.bufferedCohorts);
    await course.save();
    this.isManaging = false;
    this.bufferedCohorts = [];
  });

  @action
  cancel() {
    this.bufferedCohorts = [];
    this.isManaging = false;
  }
  @action
  addCohortToBuffer(cohort) {
    this.bufferedCohorts = [...this.bufferedCohorts, cohort];
  }
  @action
  removeCohortFromBuffer(cohort) {
    this.bufferedCohorts = this.bufferedCohorts.filter((obj) => obj.id !== cohort.id);
  }
}
