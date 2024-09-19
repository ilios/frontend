import Component from '@glimmer/component';
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

export default class ReportsSubjectResultsComponent extends Component {
  get subjectComponent() {
    switch (this.args.subject) {
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
}
