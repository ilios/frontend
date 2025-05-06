import Component from '@glimmer/component';

export default class ReportsListRowComponent extends Component {
  get showRemoveConfirmation() {
    return this.args.reportsForRemovalConfirmation.includes(this.args.decoratedReport.report.id);
  }

  get isSubjectReport() {
    return this.args.decoratedReport.type === 'subject';
  }
}
