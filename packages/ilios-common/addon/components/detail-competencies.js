import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { action } from '@ember/object';
import { TrackedAsyncData } from 'ember-async-data';

export default class DetailCompetenciesComponent extends Component {
  @cached
  get courseCompetenciesData() {
    return new TrackedAsyncData(this.args.course.competencies);
  }

  get competencyCount() {
    if (!this.courseCompetenciesData.isResolved) {
      return 0;
    }
    return this.courseCompetenciesData.value.length;
  }

  get hasCompetencies() {
    return this.competencyCount > 0;
  }

  @action
  collapse() {
    if (this.courseCompetenciesData.isResolved && this.hasCompetencies) {
      this.args.collapse();
    }
  }
}
