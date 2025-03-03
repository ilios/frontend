import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';

export default class CourseVisualizeTermComponent extends Component {
  @service iliosConfig;

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }
}
