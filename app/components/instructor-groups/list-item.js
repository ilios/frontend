import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import PermissionChecker from 'ilios/classes/permission-checker';
import { use } from 'ember-could-get-used-to-this';
import { dropTask } from 'ember-concurrency';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';

export default class InstructorGroupsListItemComponent extends Component {
  @tracked showRemoveConfirmation = false;

  @use canDeletePermission = new PermissionChecker(() => [
    'canDeleteInstructorGroup',
    this.args.instructorGroup,
  ]);

  @use courses = new ResolveAsyncValue(() => [this.args.instructorGroup.courses]);

  get canDelete() {
    return this.canDeletePermission && this.courses && this.courses.length === 0;
  }

  remove = dropTask(async () => {
    await this.args.instructorGroup.destroyRecord();
  });
}
