import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { restartableTask } from 'ember-concurrency';

export default class CourseSummaryHeaderComponent extends Component {
  @service currentUser;
  @service permissionChecker;

  @tracked canRollover;

  load = restartableTask(async () => {
    const school = await this.args.course.school;
    this.canRollover = await this.permissionChecker.canCreateCourse(school);
  });

  get showRollover() {
    return this.args.showRollover && this.canRollover;
  }
}
