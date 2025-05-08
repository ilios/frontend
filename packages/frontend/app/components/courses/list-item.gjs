import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';

export default class CoursesListItemComponent extends Component {
  @service permissionChecker;

  @cached
  get canLockData() {
    return new TrackedAsyncData(this.permissionChecker.canUpdateCourse(this.args.course));
  }

  @cached
  get canUnlockData() {
    return new TrackedAsyncData(this.permissionChecker.canUnlockCourse(this.args.course));
  }

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(this.permissionChecker.canDeleteCourse(this.args.course));
  }

  get canLock() {
    return this.canLockData.isResolved ? this.canLockData.value : false;
  }

  get canUnlock() {
    return this.canUnlockData.isResolved ? this.canUnlockData.value : false;
  }

  get canDelete() {
    if (this.args.course.isPublishedOrScheduled) {
      return false;
    } else if (this.args.course.hasMany('descendants').ids().length > 0) {
      return false;
    }
    return this.canDeleteData.isResolved ? this.canDeleteData.value : false;
  }
}
