import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency-decorators';

export default class CourseSummaryHeaderComponent extends Component {
  @service currentUser;
  @service permissionChecker;
  @service router;

  @tracked canRollover;

  @restartableTask
  *load() {
    const school = yield this.args.course.school;
    this.canRollover = yield this.permissionChecker.canCreateCourse(school);
  }

  get showRollover() {
    if (this.router.currentRouteName === 'course.rollover') {
      return false;
    }

    return this.canRollover;
  }

  get showMaterials() {
    return this.router.currentRouteName !== 'course-materials';
  }
}
