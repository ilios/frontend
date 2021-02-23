import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';

export default class CurriculumInventoryReportDetailsComponent extends Component {
  @service store;
  @tracked showFinalizeConfirmation = false;

  @dropTask
  *finalize() {
    const newExport = this.store.createRecord('curriculumInventoryExport', {
      report: this.args.report,
    });
    const savedExport = yield newExport.save();
    this.args.report.set('export', savedExport);
    this.showFinalizeConfirmation = false;
  }
}
