import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class ReportsCurriculumHeader extends Component {
  @service intl;

  get reportList() {
    return [
      {
        value: 'sessionObjectives',
        label: this.intl.t('general.sessionObjectives'),
        summary: this.intl.t('general.sessionObjectivesReportSummary', {
          courseCount: this.args.countSelectedCourses,
        }),
      },
      {
        value: 'learnerGroups',
        label: this.intl.t('general.learnerGroups'),
        summary: this.intl.t('general.learnerGroupsReportSummary', {
          courseCount: this.args.countSelectedCourses,
        }),
      },
    ];
  }

  get selectedReport() {
    return this.reportList.find((r) => r.value === this.args.selectedReportValue);
  }
}
