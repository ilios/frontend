import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import PermissionChecker from 'ilios-common/classes/permission-checker';
import { use } from 'ember-could-get-used-to-this';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';

export default class InstructorGroupsListItemComponent extends Component {
  @tracked showRemoveConfirmation = false;

  @use canDeletePermission = new PermissionChecker(() => [
    'canDeleteInstructorGroup',
    this.args.instructorGroup,
  ]);

  @cached
  get coursesData() {
    return new TrackedAsyncData(this.args.instructorGroup.courses);
  }

  get courses() {
    return this.coursesData.isResolved ? this.coursesData.value : null;
  }

  get canDelete() {
    return this.canDeletePermission && this.courses && this.courses.length === 0;
  }

  remove = dropTask(async () => {
    await this.args.instructorGroup.destroyRecord();
  });
}
