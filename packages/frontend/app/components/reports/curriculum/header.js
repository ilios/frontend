import Component from '@glimmer/component';
import { restartableTask } from 'ember-concurrency';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';

export default class ReportsCurriculumHeader extends Component {
  @service flashMessages;
  @service intl;
  @service store;

  get copyButtonId() {
    return `curriculum-report-copy-button-${guidFor(this)}`;
  }

  get copyButtonElement() {
    return document.getElementById(this.copyButtonId);
  }

  get runButtonId() {
    return `curriculum-report-run-button-${guidFor(this)}`;
  }

  get runButtonElement() {
    return document.getElementById(this.runButtonId);
  }

  get reportUrl() {
    return window.location.href;
  }

  textCopied = restartableTask(async () => {
    this.flashMessages.success('general.copiedCurriculumReportUrl');
  });

  popperOptions = {
    placement: 'right',
    modifiers: [
      {
        name: 'flip',
        options: {
          fallbackPlacements: ['bottom'],
        },
      },
    ],
  };

  get selectedSchoolIds() {
    if (!this.args.selectedCourses) {
      return [];
    }
    const schools = this.store.peekAll('school');
    let schoolIds = [];
    this.args.selectedCourses.map((course) => {
      const schoolForCourse = schools.find((school) =>
        school.hasMany('courses').ids().includes(course.id),
      );

      if (schoolForCourse) {
        schoolIds = [...schoolIds, schoolForCourse.id];
      }
    });
    return [...new Set(schoolIds)];
  }

  get countSelectedSchools() {
    return this.selectedSchoolIds.length;
  }

  get hasMultipleSchools() {
    return this.countSelectedSchools > 1;
  }

  get reportList() {
    if (this.hasMultipleSchools) {
      return [
        {
          value: 'sessionObjectives',
          label: this.intl.t('general.sessionObjectives'),
          summary: this.intl.t('general.sessionObjectivesReportSummaryMultiSchool', {
            courseCount: this.args.countSelectedCourses,
            schoolCount: this.countSelectedSchools,
          }),
        },
        {
          value: 'learnerGroups',
          label: this.intl.t('general.learnerGroups'),
          summary: this.intl.t('general.learnerGroupsReportSummaryMultiSchool', {
            courseCount: this.args.countSelectedCourses,
            schoolCount: this.countSelectedSchools,
          }),
        },
      ];
    } else {
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
  }

  get selectedReport() {
    return this.reportList.find((r) => r.value === this.args.selectedReportValue);
  }

  changeSelectedReport = ({ target }) => {
    this.args.changeSelectedReport(target.value);
  };
}
