import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class IliosCourseListComponent extends Component {
  @service intl;
  @service permissionChecker;
  @service iliosConfig;

  @tracked coursesForRemovalConfirmation = [];
  @tracked savingCourseIds = [];

  get sortedAscending() {
    return !this.args.sortBy.includes(':desc');
  }

  startSavingCourse(id) {
    this.savingCourseIds = [...this.savingCourseIds, id];
  }
  stopSavingCourse(courseId) {
    this.savingCourseIds = this.savingCourseIds.filter((id) => id !== courseId);
  }

  get sortingByStatus() {
    return this.args.sortBy.includes('status');
  }

  getStatus(course) {
    let translation = 'general.';
    if (course.get('isScheduled')) {
      translation += 'scheduled';
    } else if (course.get('isPublished')) {
      translation += 'published';
    } else {
      translation += 'notPublished';
    }
    return this.intl.t(translation);
  }

  @task
  *unlockCourse(course) {
    const permission = yield this.permissionChecker.canUnlockCourse(course);
    this.startSavingCourse(course.id);
    if (permission) {
      yield this.args.unlock(course);
      this.stopSavingCourse(course.id);
    }
  }
  @task
  *lockCourse(course) {
    const permission = yield this.permissionChecker.canUpdateCourse(course);
    this.startSavingCourse(course.id);
    if (permission) {
      yield this.args.lock(course);
      this.stopSavingCourse(course.id);
    }
  }

  @action
  confirmRemoval(course) {
    this.coursesForRemovalConfirmation = [...this.coursesForRemovalConfirmation, course.id];
  }

  @action
  cancelRemove(course) {
    this.coursesForRemovalConfirmation = this.coursesForRemovalConfirmation.filter(
      (id) => id !== course.id
    );
  }

  @action
  setSortBy(what) {
    if (this.args.sortBy === what) {
      what += ':desc';
    }
    this.args.setSortBy(what);
  }

  @action
  async canUnlock(course) {
    return this.permissionChecker.canUnlockCourse(course);
  }

  @action
  async canLock(course) {
    return this.permissionChecker.canUpdateCourse(course);
  }

  @action
  async canDelete(course) {
    if (course.get('isPublishedOrScheduled')) {
      return false;
    } else if (course.hasMany('descendants').ids().length > 0) {
      return false;
    }
    return this.permissionChecker.canDeleteCourse(course);
  }

  @action
  sortCoursesByStatus(a, b) {
    const aStatus = this.getStatus(a);
    const bStatus = this.getStatus(b);

    if (this.sortedAscending) {
      return aStatus.localeCompare(bStatus);
    }

    return bStatus.localeCompare(aStatus);
  }
}
