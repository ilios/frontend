import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import PermissionChecker from 'ilios/classes/permission-checker';
import { use } from 'ember-could-get-used-to-this';
import { dropTask } from 'ember-concurrency';

export default class ProgramListItemComponent extends Component {
  @tracked showRemoveConfirmation = false;

  @use canDeletePermission = new PermissionChecker(() => ['canDeleteProgram', this.args.program]);

  get canDelete() {
    const hasCiReports = this.args.program.hasMany('curriculumInventoryReports').ids().length > 0;
    const hasProgramYears = this.args.program.hasMany('programYears').ids().length > 0;

    return this.canDeletePermission && !hasCiReports && !hasProgramYears;
  }

  remove = dropTask(async () => {
    await this.args.program.destroyRecord();
  });
}
