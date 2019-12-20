import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency-decorators';
import { map, all } from 'rsvp';

export default class DetailCohortsComponent extends Component {
  @tracked isManaging = false;
  @tracked bufferedCohorts = [];

  @dropTask
  *manage() {
    const cohorts = yield this.args.course.cohorts;
    this.bufferedCohorts = [...cohorts.toArray()];
    this.isManaging = true;
  }

  @dropTask
  *save() {
    const { course } = this.args;
    const cohortList = yield course.cohorts;
    const removedCohorts = cohortList.filter(cohort => {
      return !this.bufferedCohorts.includes(cohort);
    });
    if (removedCohorts.length) {
      const programYearsToRemove = yield map(removedCohorts, async cohort => cohort.programYear);
      const objectives = yield course.objectives;
      yield all(objectives.invoke('removeParentWithProgramYears', programYearsToRemove));
    }
    course.set('cohorts', this.bufferedCohorts);
    yield course.save();
    this.isManaging = false;
    this.bufferedCohorts = [];
  }

  @action
  cancel(){
    this.bufferedCohorts = [];
    this.isManaging = false;
  }
  @action
  addCohortToBuffer(cohort) {
    this.bufferedCohorts = [...this.bufferedCohorts, cohort];
  }
  @action
  removeCohortFromBuffer(cohort) {
    this.bufferedCohorts = this.bufferedCohorts.filter(obj => obj.id !== cohort.id);
  }
}
