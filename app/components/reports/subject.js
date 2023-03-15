import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { isNone } from '@ember/utils';
import { ensureSafeComponent } from '@embroider/util';
import PapaParse from 'papaparse';
import { dropTask, timeout } from 'ember-concurrency';
import { use } from 'ember-could-get-used-to-this';
import createDownloadFile from 'ilios/utils/create-download-file';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import { validatable, Length } from 'ilios-common/decorators/validation';
import CourseComponent from './subject/course';
import SessionComponent from './subject/session';
import ProgramComponent from './subject/program';
import ProgramYearComponent from './subject/program-year';
import InstructorComponent from './subject/instructor';
import InstructorGroupComponent from './subject/instructor-group';
import LearningMaterialComponent from './subject/learning-material';
import CompetencyComponent from './subject/competency';
import MeshTermComponent from './subject/mesh-term';
import TermComponent from './subject/term';
import SessionTypeComponent from './subject/session-type';

@validatable
export default class ReportsSubjectComponent extends Component {
  @service currentUser;
  @service preserveScroll;
  @service reporting;
  @service store;
  @tracked finishedBuildingReport = false;
  @tracked myReportEditorOn = false;
  @tracked @Length(1, 240) title = '';

  @use allAcademicYears = new ResolveAsyncValue(() => [this.store.findAll('academic-year')]);
  @use constructedReportTitle = new AsyncProcess(() => [
    this.constructReportTitle.bind(this),
    this.args.selectedReport,
  ]);

  @use constructedReportDescription = new AsyncProcess(() => [
    this.constructReportDescription.bind(this),
    this.args.selectedReport,
  ]);

  get constructedReportTitleLoaded() {
    return !isNone(this.constructedReportTitle);
  }

  get reportDescriptionLoaded() {
    return !isNone(this.constructedReportDescription);
  }

  get reportTitle() {
    if (this.args.selectedReport.title) {
      return this.args.selectedReport.title;
    }

    if (isNone(this.constructedReportTitle)) {
      return '';
    }
    return this.constructedReportTitle;
  }

  get reportDescription() {
    if (isNone(this.constructedReportDescription)) {
      return '';
    }
    return this.constructedReportDescription;
  }

  @dropTask
  *changeTitle() {
    this.addErrorDisplayFor('title');
    const isValid = yield this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.selectedReport.title = this.title;
    yield this.args.selectedReport.save();
  }

  @action
  revertTitleChanges() {
    this.title = this.reportTitle;
  }

  get subjectComponent() {
    switch (this.args.selectedReport.subject) {
      case 'course':
        return ensureSafeComponent(CourseComponent, this);
      case 'session':
        return ensureSafeComponent(SessionComponent, this);
      case 'program':
        return ensureSafeComponent(ProgramComponent, this);
      case 'program year':
        return ensureSafeComponent(ProgramYearComponent, this);
      case 'instructor':
        return ensureSafeComponent(InstructorComponent, this);
      case 'instructor group':
        return ensureSafeComponent(InstructorGroupComponent, this);
      case 'learning material':
        return ensureSafeComponent(LearningMaterialComponent, this);
      case 'competency':
        return ensureSafeComponent(CompetencyComponent, this);
      case 'mesh term':
        return ensureSafeComponent(MeshTermComponent, this);
      case 'term':
        return ensureSafeComponent(TermComponent, this);
      case 'session type':
        return ensureSafeComponent(SessionTypeComponent, this);
    }

    return null;
  }

  async constructReportTitle(selectedReport) {
    return this.reporting.buildReportTitle(selectedReport);
  }

  async constructReportDescription(selectedReport) {
    return this.reporting.buildReportDescription(selectedReport);
  }

  get showAcademicYearFilter() {
    if (!this.args.selectedReport) {
      return false;
    }
    const { subject, prepositionalObject } = this.args.selectedReport;
    return prepositionalObject !== 'course' && ['course', 'session'].includes(subject);
  }

  @dropTask
  *downloadReport() {
    const report = this.args.selectedReport;
    const title = this.selectedReportTitle;
    const year = this.args.selectedYear;
    const data = yield this.reporting.getArrayResults(report, year);
    this.finishedBuildingReport = true;
    const csv = PapaParse.unparse(data);
    createDownloadFile(`${title}.csv`, csv, 'text/csv');
    yield timeout(2000);
    this.finishedBuildingReport = false;
  }
}
