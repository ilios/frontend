import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';

export default class InstructorGroupsListItemComponent extends Component {
  @service permissionChecker;
  @tracked showRemoveConfirmation = false;

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(
      this.permissionChecker.canDeleteInstructorGroup(this.args.instructorGroup),
    );
  }

  @cached
  get coursesData() {
    return new TrackedAsyncData(this.args.instructorGroup.courses);
  }

  get courses() {
    return this.coursesData.isResolved ? this.coursesData.value : null;
  }

  get canDelete() {
    return this.canDeleteData.isResolved
      ? this.canDeleteData.value && this.courses && this.courses.length === 0
      : false;
  }

  remove = dropTask(async () => {
    await this.args.instructorGroup.destroyRecord();
  });
}
