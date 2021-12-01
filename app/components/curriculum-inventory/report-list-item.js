import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import PermissionChecker from 'ilios/classes/permission-checker';
import { use } from 'ember-could-get-used-to-this';
import { inject as service } from '@ember/service';

export default class CurriculumInventoryReportListItemComponent extends Component {
  @service iliosConfig;
  @service permissionChecker;
  @tracked isFinalized = this.args.report.belongsTo('export').id();
  @tracked showConfirmRemoval;

  @use canDelete = new PermissionChecker(() => [
    'canDeleteCurriculumInventoryReport',
    this.args.report,
  ]);
  @use academicYearCrossesCalendarYearBoundaries = new ResolveAsyncValue(() => [
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  ]);

  get yearLabel() {
    if (this.academicYearCrossesCalendarYearBoundaries) {
      return this.args.report.year + ' - ' + (parseInt(this.args.report.year, 10) + 1);
    }
    return this.args.report.year;
  }
}
