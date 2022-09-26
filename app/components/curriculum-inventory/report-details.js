import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dropTask } from 'ember-concurrency';

export default class CurriculumInventoryReportDetailsComponent extends Component {
  @service store;
  @tracked showFinalizeConfirmation = false;

  get isFinalizing() {
    return this.finalize.isRunning;
  }

  get canUpdate() {
    return this.args.canUpdate && !this.isFinalizing;
  }

  finalize = dropTask(async () => {
    const newExport = this.store.createRecord('curriculumInventoryExport', {
      report: this.args.report,
    });
    this.showFinalizeConfirmation = false;
    const savedExport = await newExport.save();
    this.args.report.set('export', savedExport);
    this.args.setIsFinalized(true);
  });
}
