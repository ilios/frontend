import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { validatable, Length, Custom } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { findById } from 'ilios-common/utils/array-helpers';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { ensureSafeComponent } from '@embroider/util';
import NewCompetencyComponent from './subject/new/competency';
import NewCourseComponent from './subject/new/course';
import NewInstructorComponent from './subject/new/instructor';
import NewInstructorGroupComponent from './subject/new/instructor-group';
import NewLearningMaterialComponent from './subject/new/learning-material';
import NewMeshTermComponent from './subject/new/mesh-term';
import NewProgramComponent from './subject/new/program';
import NewProgramYearComponent from './subject/new/program-year';
import NewSessionComponent from './subject/new/session';
import NewTermComponent from './subject/new/term';

@validatable
export default class ReportsNewSubjectComponent extends Component {
  @service currentUser;
  @service intl;
  @service store;
  @service dataLoader;

  @Custom(
    'validateCurrentPrepositionalObjectCallback',
    'validateCurrentPrepositionalObjectMessageCallback'
  )
  @tracked
  currentPrepositionalObject = null;
  @Custom(
    'validateCurrentPrepositionalObjectIdCallback',
    'validateCurrentPrepositionalObjectIdMessageCallback'
  )
  @tracked
  currentPrepositionalObjectId = null;
  @tracked currentSubject = 'course';
  @tracked isSaving = false;
  @tracked selectedSchool = null;
  @tracked schoolChanged = false;
  @tracked @Length(1, 240) title;
  subjectList = [
    { value: 'course', label: this.intl.t('general.courses') },
    { value: 'session', label: this.intl.t('general.sessions') },
    { value: 'program', label: this.intl.t('general.programs') },
    { value: 'program year', label: this.intl.t('general.programYears') },
    { value: 'instructor', label: this.intl.t('general.instructors') },
    {
      value: 'instructor group',
      label: this.intl.t('general.instructorGroups'),
    },
    {
      value: 'learning material',
      label: this.intl.t('general.learningMaterials'),
    },
    { value: 'competency', label: this.intl.t('general.competencies') },
    { value: 'mesh term', label: this.intl.t('general.meshTerms') },
    { value: 'term', label: this.intl.t('general.terms') },
    { value: 'session type', label: this.intl.t('general.sessionTypes') },
  ];
  fullPrepositionalObjectList = [
    {
      value: 'course',
      label: this.intl.t('general.course'),
      subjects: [
        'session',
        'program',
        'program year',
        'instructor',
        'instructor group',
        'learning material',
        'competency',
        'mesh term',
        'session type',
        'term',
      ],
    },
    {
      value: 'session',
      label: this.intl.t('general.session'),
      subjects: [
        'program',
        'program year',
        'instructor',
        'instructor group',
        'learning material',
        'competency',
        'mesh term',
        'term',
      ],
    },
    {
      value: 'program year',
      label: this.intl.t('general.programYear'),
      subjects: ['term'],
    },
    {
      value: 'program',
      label: this.intl.t('general.program'),
      subjects: ['course', 'session', 'session type', 'term'],
    },
    {
      value: 'instructor',
      label: this.intl.t('general.instructor'),
      subjects: [
        'course',
        'session',
        'instructor group',
        'learning material',
        'session type',
        'term',
      ],
    },
    {
      value: 'instructor group',
      label: this.intl.t('general.instructorGroup'),
      subjects: ['course', 'session', 'instructor', 'learning material', 'session type'],
    },
    {
      value: 'learning material',
      label: this.intl.t('general.learningMaterial'),
      subjects: [
        'course',
        'session',
        'instructor',
        'instructor group',
        'mesh term',
        'session type',
        'term',
      ],
    },
    {
      value: 'competency',
      label: this.intl.t('general.competency'),
      subjects: ['course', 'session', 'session type', 'term'],
    },
    {
      value: 'mesh term',
      label: this.intl.t('general.meshTerm'),
      subjects: ['course', 'session', 'learning material', 'session type', 'term'],
    },
    {
      value: 'session type',
      label: this.intl.t('general.sessionType'),
      subjects: [
        'session',
        'instructor',
        'instructor group',
        'learning material',
        'competency',
        'mesh term',
        'term',
      ],
    },
    {
      value: 'term',
      label: this.intl.t('general.term'),
      subjects: ['course', 'session', 'program', 'program year', 'session type'],
    },
  ];

  userModelData = new TrackedAsyncData(this.currentUser.getModel());

  @cached
  get userModel() {
    return this.userModelData.isResolved ? this.userModelData.value : null;
  }

  @cached
  get usersPrimarySchoolData() {
    return new TrackedAsyncData(this.userModel?.school);
  }

  get usersPrimarySchool() {
    return this.usersPrimarySchoolData.isResolved ? this.usersPrimarySchoolData.value : null;
  }

  @cached
  get allSchoolsData() {
    return new TrackedAsyncData(this.store.findAll('school'));
  }

  get allSchools() {
    return this.allSchoolsData.isResolved ? this.allSchoolsData.value : [];
  }

  get newPrepositionalObjectComponent() {
    switch (this.currentPrepositionalObject) {
      case 'competency':
        return ensureSafeComponent(NewCompetencyComponent, this);
      case 'course':
        return ensureSafeComponent(NewCourseComponent, this);
      case 'instructor':
        return ensureSafeComponent(NewInstructorComponent, this);
      case 'instructor group':
        return ensureSafeComponent(NewInstructorGroupComponent, this);
      case 'learning material':
        return ensureSafeComponent(NewLearningMaterialComponent, this);
      case 'mesh term':
        return ensureSafeComponent(NewMeshTermComponent, this);
      case 'program':
        return ensureSafeComponent(NewProgramComponent, this);
      case 'program year':
        return ensureSafeComponent(NewProgramYearComponent, this);
      case 'session':
        return ensureSafeComponent(NewSessionComponent, this);
      case 'term':
        return ensureSafeComponent(NewTermComponent, this);
    }

    return null;
  }

  get prepositionalObjectList() {
    return this.fullPrepositionalObjectList.filter((item) =>
      item.subjects.includes(this.currentSubject)
    );
  }

  get currentSubjectLabel() {
    const currentSubject = this.subjectList.find((subject) => {
      return subject.value === this.currentSubject;
    });

    return currentSubject.label;
  }

  get selectedUser() {
    if (this.currentPrepositionalObject === 'instructor' && this.currentPrepositionalObjectId) {
      return this.store.peekRecord('user', this.currentPrepositionalObjectId);
    } else {
      return null;
    }
  }

  get selectedMeshTerm() {
    if (this.currentPrepositionalObject === 'mesh term' && this.currentPrepositionalObjectId) {
      return this.store.peekRecord('mesh-descriptor', this.currentPrepositionalObjectId);
    } else {
      return null;
    }
  }

  get currentSchool() {
    if (this.selectedSchool) {
      return this.selectedSchool;
    }

    //if the school has been set to null intentionally
    if (this.schoolChanged) {
      return null;
    }

    return this.usersPrimarySchool;
  }

  @action
  changeSubject(subject) {
    this.currentSubject = subject;
    this.currentPrepositionalObject = null;
    this.currentPrepositionalObjectId = null;
    this.clearErrorDisplay();
  }

  @action
  changePrepositionalObject(object) {
    this.currentPrepositionalObject = object;
    this.currentPrepositionalObjectId = null;
    this.clearErrorDisplay();
  }

  keyUp(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (27 === keyCode) {
      this.close();
    }
  }

  @dropTask
  *save() {
    this.addErrorDisplaysFor([
      'title',
      'currentPrepositionalObject',
      'currentPrepositionalObjectId',
    ]);
    const isValid = yield this.isValid();
    if (!isValid) {
      return false;
    }
    this.clearErrorDisplay();

    const report = this.store.createRecord('report', {
      title: this.title,
      user: this.userModel,
      subject: this.currentSubject,
      prepositionalObject: this.currentPrepositionalObject,
      prepositionalObjectTableRowId: this.currentPrepositionalObjectId,
      school: this.currentSchool,
    });
    yield this.args.save.perform(report);
    this.args.close();
  }

  @action
  changeSchool(schoolId) {
    this.selectedSchool = findById(this.allSchools.slice(), schoolId);
    this.schoolChanged = true;
  }

  @action
  validateCurrentPrepositionalObjectIdCallback() {
    return !(this.currentPrepositionalObject && !this.currentPrepositionalObjectId);
  }

  @action
  validateCurrentPrepositionalObjectIdMessageCallback() {
    if (this.currentPrepositionalObject && !this.currentPrepositionalObjectId) {
      if (this.currentPrepositionalObject === 'instructor') {
        return this.intl.t('errors.reportMissingInstructor');
      }
      if (this.currentPrepositionalObject === 'mesh term') {
        return this.intl.t('errors.reportMissingMeshTerm');
      }
    }
  }

  @action
  validateCurrentPrepositionalObjectCallback() {
    if (this.currentSubject && !this.currentPrepositionalObject) {
      return !['instructor', 'mesh term'].includes(this.currentSubject);
    }
    return true;
  }

  @action
  validateCurrentPrepositionalObjectMessageCallback() {
    if (this.currentSubject && !this.currentPrepositionalObject) {
      if (this.currentSubject === 'instructor') {
        return this.intl.t('errors.reportMissingObjectForInstructor');
      }
      if (this.currentSubject === 'mesh term') {
        return this.intl.t('errors.reportMissingObjectForMeshTerm');
      }
    }
  }
}
