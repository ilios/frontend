import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import { use } from 'ember-could-get-used-to-this';
import { inject as service } from '@ember/service';

export default class CurriculumInventoryReportListItemComponent extends Component {
  @service iliosConfig;
  @service permissionChecker;

  @tracked userCanDelete = false;
  @tracked showConfirmRemoval;

  @use canDeletePermission = new AsyncProcess(() => [
    this.permissionChecker.canDeleteCurriculumInventoryReport,
    this.args.report,
  ]);

  @use academicYearCrossesCalendarYearBoundaries = new ResolveAsyncValue(() => [
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries')
  ]);

  get canDelete() {
    return this.canDeletePermission;
  }

  get yearLabel() {
    if (this.academicYearCrossesCalendarYearBoundaries) {
      return this.args.report.year + ' - ' + (parseInt(this.args.report.year, 10) + 1);
    }
    return this.args.report.year;
  }
}
