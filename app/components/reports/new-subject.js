import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { map } from 'rsvp';
import { dropTask, restartableTask } from 'ember-concurrency';
import { dasherize } from '@ember/string';
import { validatable, Length, Custom } from 'ilios-common/decorators/validation';
import ResolveAsyncValue from 'ilios-common/classes/resolve-async-value';
import AsyncProcess from 'ilios-common/classes/async-process';
import { findById } from 'ilios-common/utils/array-helpers';
import { use } from 'ember-could-get-used-to-this';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

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
  @tracked selectedYear = null;
  @tracked schoolChanged = false;
  @tracked @Length(1, 240) title;
  subjectList = [];
  fullPrepositionalObjectList = [];

  loadedPrepositionalObjects = new Map();

  @use userModel = new ResolveAsyncValue(() => [this.currentUser.getModel()]);
  @use usersPrimarySchool = new ResolveAsyncValue(() => [this.userModel?.school]);
  @use allSchools = new ResolveAsyncValue(() => [this.store.findAll('school'), []]);
  @use allAcademicYears = new ResolveAsyncValue(() => [this.store.findAll('academic-year'), []]);
  @use prepositionalObjectIdList = new AsyncProcess(() => [
    this.getPrepositionalObjectIdList.bind(this),
    this.currentPrepositionalObject,
    this.currentSchool,
    this.isCourse,
    this.isSession,
  ]);

  get isCourse() {
    return this.currentPrepositionalObject === 'course';
  }
  get isSession() {
    return this.currentPrepositionalObject === 'session';
  }

  get isPrepositionalObjectIdListLoaded() {
    return Boolean(this.prepositionalObjectIdList);
  }

  constructor() {
    super(...arguments);
    this.subjectList = [
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

    this.fullPrepositionalObjectList = [
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
  }

  get prepositionalObjectList() {
    return this.fullPrepositionalObjectList.filter((item) =>
      item.subjects.includes(this.currentSubject)
    );
  }

  async getPrepositionalObjectIdList() {
    if (
      !this.currentPrepositionalObject ||
      this.currentPrepositionalObject === 'instructor' ||
      this.currentPrepositionalObject === 'mesh term'
    ) {
      return [];
    }

    const key = [
      this.currentPrepositionalObject,
      this.school?.id ?? 'noschool',
      this.isCourse ? 'course' : 'nocourse',
      this.isSession ? 'session' : 'nosession',
    ].join();

    if (!this.loadedPrepositionalObjects.has(key)) {
      this.loadedPrepositionalObjects.set(key, this.getPrepositionalObjectIdListPromise());
    }

    return await this.loadedPrepositionalObjects.get(key);
  }

  async getPrepositionalObjectIdListPromise() {
    const model = dasherize(this.currentPrepositionalObject);
    const query = {
      filters: {},
    };
    if (this.currentSchool) {
      const schoolScopedModels = [
        'session',
        'course',
        'program',
        'session-type',
        'instructor-group',
        'competency',
        'term',
      ];
      if (schoolScopedModels.includes(model)) {
        if ('session' === model || 'term' === model) {
          query.filters.schools = [this.currentSchool.id];
        } else {
          query.filters.school = this.currentSchool.id;
        }
      }
    }
    if ('session' === model) {
      query.include = 'course';
    }
    const objects = await this.store.query(model, query);

    return await map(objects.slice(), async (obj) => {
      const po = new PrepositionObject(this.currentPrepositionalObject, obj);
      const academicYear = await po.getAcademicYear();
      const label = await po.getLabel();
      const { active, value } = po;
      const payload = { academicYear, active, label, value };

      if (this.isCourse) {
        payload.externalId = po.model.externalId;
      }

      if (this.isSession) {
        const course = await po.model.course;
        payload.courseTitle = course.title;
      }

      return payload;
    });
  }

  get currentYear() {
    return this.selectedYear ? Number(this.selectedYear) : null;
  }

  get filteredPrepositionalObjectIdList() {
    const list = this.prepositionalObjectIdList ?? [];

    return this.filterPrepositionalObjectsByAcademicYear(
      list,
      this.currentYear,
      this.currentPrepositionalObject
    );
  }

  filterPrepositionalObjectsByAcademicYear(list, year, currentPrepositionalObject) {
    return list.filter((obj) => {
      if (!year || !['course', 'session'].includes(currentPrepositionalObject)) {
        return true;
      }

      return obj.academicYear === year;
    });
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
    this.resetCurrentPrepositionalObjectId.perform();
    this.clearErrorDisplay();
  }

  @action
  changeSelectedYear(year) {
    this.selectedYear = year;
    this.currentPrepositionalObjectId = null;
    this.resetCurrentPrepositionalObjectId.perform();
    this.clearErrorDisplay();
  }

  @action
  changePrepositionalObjectId(id) {
    this.currentPrepositionalObjectId = id;
  }

  @action
  chooseInstructor(user) {
    this.currentPrepositionalObjectId = user.id;
  }

  @action
  chooseMeshTerm(term) {
    this.currentPrepositionalObjectId = term.id;
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

  @restartableTask
  *resetCurrentPrepositionalObjectId() {
    const list = this.filterPrepositionalObjectsByAcademicYear(
      yield this.getPrepositionalObjectIdList(),
      this.currentYear,
      this.currentPrepositionalObject
    );

    if (list.length) {
      this.currentPrepositionalObjectId = list[0].value;
    }
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

class PrepositionObject {
  model = null;
  type = null;

  constructor(type, model) {
    this.type = type;
    this.model = model;
  }

  get value() {
    return this.model.id;
  }

  async getLabel() {
    if (this.type === 'mesh term') {
      return this.model.name;
    } else if (this.type === 'term') {
      const vocabulary = await this.model.vocabulary;
      const titleWithParentTitles = await this.model.titleWithParentTitles;
      return `${vocabulary.title} > ${titleWithParentTitles}`;
    }

    return this.model.title;
  }

  async getAcademicYear() {
    if (this.type === 'course') {
      return Number(this.model.year);
    } else if (this.type === 'session') {
      const course = await this.model.course;
      return Number(course.year);
    }

    return null;
  }

  get active() {
    if (['session type', 'term'].includes(this.type)) {
      return this.model.active;
    }
    return true;
  }
}
