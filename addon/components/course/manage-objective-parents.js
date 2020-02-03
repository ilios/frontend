import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class CourseManageObjectiveParentsComponent extends Component {
  @tracked selectedCohort;

  @action
  chooseFirstCohort(element, [cohorts]) {
    if (cohorts) {
      this.selectedCohort = cohorts[0];
    }
  }

  @action
  chooseCohort(event) {
    const cohortId = event.target.value;
    this.selectedCohort = this.args.cohortObjectives.findBy('id', cohortId);
  }
}
