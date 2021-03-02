import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { restartableTask } from 'ember-concurrency';

export default class CurriculumInventoryReportListItemComponent extends Component {
  @service permissionChecker;
  @service iliosConfig;

  @tracked userCanDelete = false;
  @tracked academicYearCrossesCalendarYearBoundaries = false;
  @tracked showConfirmRemoval;

  get yearLabel() {
    if (this.academicYearCrossesCalendarYearBoundaries) {
      return this.args.report.year + ' - ' + (parseInt(this.args.report.year, 10) + 1);
    }
    return this.args.report.year;
  }

  @restartableTask
  *load() {
    this.academicYearCrossesCalendarYearBoundaries
      = yield this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries');
    this.userCanDelete = yield this.permissionChecker.canDeleteCurriculumInventoryReport(this.args.report);
  }
}
