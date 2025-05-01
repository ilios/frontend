import Component from '@glimmer/component';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { validatable, Length, Custom } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';
import { cached, tracked } from '@glimmer/tracking';
import { findById } from 'ilios-common/utils/array-helpers';
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
import NewSessionTypeComponent from './subject/new/session-type';
import NewTermComponent from './subject/new/term';
import NewAcademicYearComponent from './subject/new/academic-year';

@validatable
export default class ReportsNewSubjectComponent extends Component {
  @service currentUser;
  @service intl;
  @service store;
  @service dataLoader;

  @tracked selectedPrepositionalObject;
  @tracked selectedPrepositionalObjectId;
  @tracked selectedTitle;

  @tracked isSaving = false;
  @tracked schoolChanged = false;

  get selectedSchoolId() {
    return this.args.selectedSchoolId ?? null;
  }

  @Custom('validatePrepositionalObjectCallback', 'validatePrepositionalObjectMessageCallback')
  get prepositionalObject() {
    return this.selectedPrepositionalObject ?? this.args.report?.prepositionalObject;
  }

  @Custom('validatePrepositionalObjectIdCallback', 'validatePrepositionalObjectIdMessageCallback')
  get prepositionalObjectId() {
    return this.selectedPrepositionalObjectId ?? this.args.report?.prepositionalObjectTableRowId;
  }

  get prepositionalObjectIdMissing() {
    return this.prepositionalObject && !this.prepositionalObjectId;
  }

  get subject() {
    return this.args.selectedSubject ?? this.args.report?.subject ?? 'course';
  }

  @Length(1, 240)
  get title() {
    return this.selectedTitle ?? this.args.report?.title;
  }

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
      subjects: ['course', 'term'],
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
      subjects: ['course', 'session', 'learning material', 'session type'],
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
    {
      value: 'academic year',
      label: this.intl.t('general.academicYear'),
      subjects: [
        'course',
        'session',
        'instructor',
        'instructor group',
        'competency',
        'session type',
        'term',
      ],
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
    switch (this.prepositionalObject) {
      case 'academic year':
        return ensureSafeComponent(NewAcademicYearComponent, this);
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
      case 'session type':
        return ensureSafeComponent(NewSessionTypeComponent, this);
      case 'term':
        return ensureSafeComponent(NewTermComponent, this);
    }

    return null;
  }

  get prepositionalObjectList() {
    return this.fullPrepositionalObjectList.filter((item) => item.subjects.includes(this.subject));
  }

  get subjectLabel() {
    const subject = this.subjectList.find((subject) => {
      return subject.value === this.subject;
    });

    return subject.label;
  }

  get currentSchool() {
    if (this.selectedSchoolId) {
      return findById(this.allSchools, this.selectedSchoolId);
    }

    //if the school has been set to null intentionally
    if (this.schoolChanged) {
      return null;
    }

    return this.usersPrimarySchool;
  }

  get includeAnythingObject() {
    const exceptedSubjects = ['instructor', 'mesh term'];
    return !exceptedSubjects.includes(this.subject);
  }

  @action
  changeSubject(subject) {
    this.args.setSelectedSubject(subject);

    if (this.includeAnythingObject) {
      this.changePrepositionalObject(null);
    } else {
      const firstPrepositionalObjectLabel = Object.values(this.prepositionalObjectList)
        .map((item) => item.label)
        .sort()[0];
      const firstPrepositionalObject = this.fullPrepositionalObjectList.filter(
        (item) => item.label === firstPrepositionalObjectLabel,
      )[0].value;

      this.changePrepositionalObject(firstPrepositionalObject);
    }
  }

  @action
  changePrepositionalObject(object, id = null) {
    this.selectedPrepositionalObject = object;
    this.selectedPrepositionalObjectId = id;
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

  save = dropTask(async () => {
    this.addErrorDisplaysFor(['title', 'prepositionalObject', 'prepositionalObjectId']);
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.clearErrorDisplay();

    const report = this.store.createRecord('report', {
      title: this.title,
      user: this.userModel,
      subject: this.subject,
      prepositionalObject: this.prepositionalObject,
      prepositionalObjectTableRowId: this.prepositionalObjectId,
      school: this.currentSchool,
    });
    await this.args.save(report);
    this.args.close();
  });

  run = dropTask(async () => {
    this.addErrorDisplaysFor(['title', 'prepositionalObject', 'prepositionalObjectId']);
    const isValid = await this.isValid();
    if (!isValid) {
      const dropdownObjectTypes = [
        'academic year',
        'competency',
        'instructor-group',
        'program',
        'program year',
        'session-type',
        'term',
      ];

      if (dropdownObjectTypes.includes(this.prepositionalObject) && !this.prepositionalObjectId) {
        const select = document.querySelector('select[data-test-prepositional-objects]');
        select.classList.add('error');
        select.focus();
      }
      return false;
    }
    this.clearErrorDisplay();

    this.args.run(
      this.subject,
      this.prepositionalObject,
      this.prepositionalObjectId,
      this.currentSchool,
    );
  });

  @action
  changeSchool(schoolId) {
    this.args.setSelectedSchoolId(schoolId);
    this.schoolChanged = true;
  }

  @action
  validatePrepositionalObjectIdCallback() {
    return !(this.prepositionalObject && !this.prepositionalObjectId);
  }

  @action
  validatePrepositionalObjectIdMessageCallback() {
    if (this.prepositionalObjectIdMissing) {
      switch (this.prepositionalObject) {
        case 'academic year':
          return this.intl.t('errors.reportMissingAcademicYear');
        case 'competency':
          return this.intl.t('errors.reportMissingCompetency');
        case 'instructor':
          return this.intl.t('errors.reportMissingInstructor');
        case 'instructor group':
          return this.intl.t('errors.reportMissingInstructorGroup');
        case 'mesh term':
          return this.intl.t('errors.reportMissingMeshTerm');
        case 'program':
          return this.intl.t('errors.reportMissingProgram');
        case 'program year':
          return this.intl.t('errors.reportMissingProgramYear');
        case 'session type':
          return this.intl.t('errors.reportMissingSessionType');
        case 'term':
          return this.intl.t('errors.reportMissingTerm');
      }
    }
  }

  @action
  validatePrepositionalObjectCallback() {
    if (this.subject && !this.prepositionalObject) {
      return this.includeAnythingObject;
    }
    return true;
  }

  @action
  validatePrepositionalObjectMessageCallback() {
    if (this.subject && !this.prepositionalObject) {
      switch (this.subject) {
        case 'academic year':
          return this.intl.t('errors.reportMissingObjectForAcademicYear');
        case 'competency':
          return this.intl.t('errors.reportMissingObjectForCompetency');
        case 'instructor':
          return this.intl.t('errors.reportMissingObjectForInstructor');
        case 'instructor group':
          return this.intl.t('errors.reportMissingObjectForInstructorGroup');
        case 'mesh term':
          return this.intl.t('errors.reportMissingObjectForMeshTerm');
        case 'program':
          return this.intl.t('errors.reportMissingObjectForProgram');
        case 'program year':
          return this.intl.t('errors.reportMissingObjectForProgramYear');
        case 'session type':
          return this.intl.t('errors.reportMissingObjectForSessionType');
        case 'term':
          return this.intl.t('errors.reportMissingObjectForTerm');
      }
    }
  }
}
