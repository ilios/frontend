import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class CurriculumInventoryReportRolloverController extends Controller {
  @action
  loadReport(newReport) {
    this.transitionToRoute('curriculumInventoryReport', newReport);
  }
}
