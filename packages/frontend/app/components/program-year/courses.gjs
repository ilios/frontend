import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class ProgramYearCoursesComponent extends Component {
  @cached
  get cohortData() {
    return new TrackedAsyncData(this.args.programYear.cohort);
  }

  @cached
  get coursesData() {
    if (!this.cohortData.isResolved) {
      return null;
    }
    return new TrackedAsyncData(this.cohortData.value.courses);
  }

  get courses() {
    return this.coursesData?.isResolved ? this.coursesData.value : [];
  }
}
