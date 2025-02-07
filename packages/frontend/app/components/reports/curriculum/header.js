import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class ReportsCurriculumHeader extends Component {
  @service intl;

  reportList = [
    { value: 'sessionObjectives', label: this.intl.t('general.sessionObjectives') },
    { value: 'learnerGroups', label: this.intl.t('general.learnerGroups') },
  ];

  get selectedReport() {
    return this.reportList.find((r) => r.value === this.args.selectedReportValue);
  }
}
