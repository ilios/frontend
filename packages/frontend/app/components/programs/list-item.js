import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';

export default class ProgramListItemComponent extends Component {
  @service permissionChecker;
  @tracked showRemoveConfirmation = false;

  @cached
  get canDeleteData() {
    return new TrackedAsyncData(this.permissionChecker.canDeleteProgram(this.args.program));
  }

  get canDelete() {
    const hasCiReports = this.args.program.hasMany('curriculumInventoryReports').ids().length > 0;
    const hasProgramYears = this.args.program.hasMany('programYears').ids().length > 0;

    return this.canDeleteData.isResolved
      ? this.canDeleteData.value && !hasCiReports && !hasProgramYears
      : false;
  }

  remove = dropTask(async () => {
    await this.args.program.destroyRecord();
  });
}
