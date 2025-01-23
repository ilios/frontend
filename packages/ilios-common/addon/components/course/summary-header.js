import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class CourseSummaryHeaderComponent extends Component {
  @service permissionChecker;

  @cached
  get canRolloverData() {
    return new TrackedAsyncData(this.getCanRollover(this.args.course));
  }

  get canRollover() {
    return this.canRolloverData.isResolved ? this.canRolloverData.value : false;
  }

  async getCanRollover(course) {
    const school = await course.school;
    return this.permissionChecker.canCreateCourse(school);
  }
}
