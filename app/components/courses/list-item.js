import Component from '@glimmer/component';
import PermissionChecker from 'ilios-common/classes/permission-checker';
import { use } from 'ember-could-get-used-to-this';
import { dropTask } from 'ember-concurrency';

export default class CoursesListItemComponent extends Component {
  @use canLock = new PermissionChecker(() => ['canUpdateCourse', this.args.course]);
  @use canUnlock = new PermissionChecker(() => ['canUnlockCourse', this.args.course]);
  @use canDeletePermission = new PermissionChecker(() => ['canDeleteCourse', this.args.course]);

  get canDelete() {
    if (this.args.course.isPublishedOrScheduled) {
      return false;
    } else if (this.args.course.hasMany('descendants').ids().length > 0) {
      return false;
    }
    return this.canDeletePermission;
  }

  @dropTask
  *unlockCourse() {
    yield this.args.unlockCourse(this.args.course);
  }
  @dropTask
  *lockCourse() {
    yield this.args.lockCourse(this.args.course);
  }
}
