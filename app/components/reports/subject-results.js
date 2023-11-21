import Component from '@glimmer/component';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
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
import { ensureSafeComponent } from '@embroider/util';
import { service } from '@ember/service';

export default class ReportsSubjectResultsComponent extends Component {
  @service reporting;
  @service store;

  @cached
  get allAcademicYearsData() {
    return new TrackedAsyncData(this.store.findAll('academic-year'));
  }

  get allAcademicYears() {
    return this.allAcademicYearsData.isResolved ? this.allAcademicYearsData.value : null;
  }

  @cached
  get reportDescriptionData() {
    return this.reporting.buildReportDescription(this.args.report);
  }

  get subjectComponent() {
    switch (this.args.report.subject) {
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

  get showAcademicYearFilter() {
    const { subject, prepositionalObject } = this.args.report;
    return prepositionalObject !== 'course' && ['course', 'session'].includes(subject);
  }
}
