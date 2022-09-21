import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { findById, mapBy, sortBy } from '../../utils/array-helpers';

export default class CourseManageObjectiveParentsComponent extends Component {
  @tracked userSelectedCohort;

  get selectedCohort() {
    if (this.userSelectedCohort && this.args.cohortObjectives.includes(this.userSelectedCohort)) {
      return this.userSelectedCohort;
    }

    if (this.args.cohortObjectives.length) {
      return this.args.cohortObjectives[0];
    }

    return null;
  }

  @action
  chooseCohort(event) {
    const cohortId = event.target.value;
    this.userSelectedCohort = findById(this.args.cohortObjectives, cohortId);
  }

  get selectedCompetencyIdsInSelectedCohort() {
    const selectedInCohort = this.args.selected.filter(
      (obj) => obj.cohortId === this.selectedCohort.id
    );
    return mapBy(selectedInCohort, 'competencyId');
  }

  get competenciesFromSelectedCohort() {
    return sortBy(this.selectedCohort.competencies, 'title');
  }
}
