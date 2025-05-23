import Component from '@glimmer/component';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { validatable, Custom } from 'ilios-common/decorators/validation';
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
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import ValidationError from 'ilios-common/components/validation-error';
import eq from 'ember-truth-helpers/helpers/eq';
import sortBy from 'ilios-common/helpers/sort-by';
import perform from 'ember-concurrency/helpers/perform';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

@validatable
export default class ReportsNewSubjectComponent extends Component {
  @service currentUser;
  @service intl;
  @service store;
  @service dataLoader;

  @tracked isSaving = false;
  @tracked schoolChanged = false;

  validations = new YupValidations(this, {
    title: string().ensure().trim().optional().max(240),
    prepositionalObject: string().test(
      'prepositional-object',
      (d) => {
        let messageKey;
        if (this.subject && !this.prepositionalObject) {
          switch (this.subject) {
            case 'academic year':
              messageKey = 'errors.reportMissingObjectForAcademicYear';
              break;
            case 'competency':
              messageKey = 'errors.reportMissingObjectForCompetency';
              break;
            case 'instructor':
              messageKey = 'errors.reportMissingObjectForInstructor';
              break;
            case 'instructor group':
              messageKey = 'errors.reportMissingObjectForInstructorGroup';
              break;
            case 'mesh term':
              messageKey = 'errors.reportMissingObjectForMeshTerm';
              break;
            case 'program':
              messageKey = 'errors.reportMissingObjectForProgram';
              break;
            case 'program year':
              messageKey = 'errors.reportMissingObjectForProgramYear';
              break;
            case 'session type':
              messageKey = 'errors.reportMissingObjectForSessionType';
              break;
            case 'term':
              messageKey = 'errors.reportMissingObjectForTerm';
              break;
          }
        }
        return {
          path: d.path,
          messageKey,
        };
      },
      (value) => {
        if (this.subject && !value) {
          return this.includeAnythingObject;
        }
        return true;
      },
    ),
  });

  get title() {
    return this.args.title ?? this.args.report?.title;
  }

  get prepositionalObject() {
    return this.args.selectedPrepositionalObject ?? this.args.report?.prepositionalObject;
  }

  @Custom('validatePrepositionalObjectIdCallback', 'validatePrepositionalObjectIdMessageCallback')
  get prepositionalObjectId() {
    return (
      this.args.selectedPrepositionalObjectId ?? this.args.report?.prepositionalObjectTableRowId
    );
  }

  get prepositionalObjectIdMissing() {
    return this.prepositionalObject && !this.prepositionalObjectId;
  }

  get subject() {
    return this.args.selectedSubject ?? this.args.report?.subject ?? 'course';
  }

  get subjectList() {
    return [
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
  }
  get fullPrepositionalObjectList() {
    return [
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
  }

  @cached
  get userModelData() {
    return new TrackedAsyncData(this.currentUser.getModel());
  }

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

  get selectedSchoolId() {
    return this.args.selectedSchoolId ?? null;
  }

  get includeAnythingObject() {
    const exceptedSubjects = ['instructor', 'mesh term'];
    return !exceptedSubjects.includes(this.subject);
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
    // new-style form validation.
    this.validations.addErrorDisplayForAllFields();
    let isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();

    // old-style form validation.
    this.addErrorDisplaysFor(['prepositionalObjectId']);
    isValid = await this.isValid();
    if (!isValid) {
      return false;
    }
    this.clearErrorDisplay();

    const report = this.store.createRecord('report', {
      title: this.title,
      user: this.userModel ?? (await this.currentUser.getModel()),
      subject: this.subject,
      prepositionalObject: this.prepositionalObject,
      prepositionalObjectTableRowId: this.prepositionalObjectId,
      school: this.currentSchool,
    });
    await this.args.save(report);
    this.args.close();
  });

  run = dropTask(async () => {
    // new-style form validation.
    this.validations.addErrorDisplayForAllFields();
    const isValidNew = await this.validations.isValid();

    // old-style form validation.
    this.addErrorDisplaysFor(['prepositionalObjectId']);
    const isValidOld = await this.isValid();

    if (!isValidNew || !isValidOld) {
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
    this.validations.clearErrorDisplay();

    this.args.run(
      this.subject,
      this.prepositionalObject,
      this.prepositionalObjectId,
      this.currentSchool,
    );
  });

  @action
  changeTitle(title) {
    this.args.setTitle(title);
  }

  @action
  changeSchool(schoolId) {
    this.args.setSelectedSchoolId(schoolId);
    this.schoolChanged = true;
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
    this.args.setSelectedPrepositionalObject(object);
    this.args.setSelectedPrepositionalObjectId(id);
    this.validations.clearErrorDisplay();
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
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="reports-new-subject" data-test-reports-new-subject ...attributes>
        <div class="title" data-test-component-title>
          {{t "general.newReport"}}
        </div>
        <div class="new-subject-content">
          <p data-test-title>
            <label for="title-{{templateId}}">
              {{t "general.reportTitle"}}:
            </label>
            <div>
              <input
                id="title-{{templateId}}"
                type="text"
                value={{this.title}}
                {{on "input" (pick "target.value" this.changeTitle)}}
                {{this.validations.attach "title"}}
              />
              <YupValidationMessage
                @description={{t "general.title"}}
                @validationErrors={{this.validations.errors.title}}
                data-test-title-validation-error-message
              />
            </div>
          </p>
          <p data-test-school>
            <label for="for-{{templateId}}">
              {{t "general.for"}}
            </label>
            <select id="for-{{templateId}}" {{on "change" (pick "target.value" this.changeSchool)}}>
              <option value="null" selected={{eq null this.currentSchool}}>
                {{t "general.allSchools"}}
              </option>
              {{#each (sortBy "title" this.allSchools) as |school|}}
                <option value={{school.id}} selected={{eq school.id this.currentSchool.id}}>
                  {{school.title}}
                </option>
              {{/each}}
            </select>
          </p>
          <p data-test-subject>
            <label for="all-{{templateId}}">
              {{t "general.all"}}
            </label>
            <select
              id="all-{{templateId}}"
              {{on "change" (pick "target.value" this.changeSubject)}}
            >
              {{#each this.subjectList as |o|}}
                <option value={{o.value}} selected={{eq o.value this.subject}}>
                  {{o.label}}
                </option>
              {{/each}}
            </select>
          </p>
          <p data-test-object>
            <label for="associated-{{templateId}}">
              {{t "general.associatedWith"}}
            </label>
            <div>
              <select
                id="associated-{{templateId}}"
                {{on "change" (pick "target.value" this.changePrepositionalObject)}}
              >
                {{#if this.includeAnythingObject}}
                  <option value selected={{eq null this.prepositionalObject}}>
                    {{t "general.anything"}}
                  </option>
                {{/if}}
                {{#each (sortBy "label" this.prepositionalObjectList) as |o|}}
                  <option value={{o.value}} selected={{eq o.value this.prepositionalObject}}>
                    {{o.label}}
                  </option>
                {{/each}}
              </select>
              <YupValidationMessage
                @validationErrors={{this.validations.errors.prepositionalObject}}
                data-test-prepositional-object-validation-error-message
              />
            </div>
          </p>
          <this.newPrepositionalObjectComponent
            @school={{this.currentSchool}}
            @templateId={{templateId}}
            @currentId={{this.prepositionalObjectId}}
            @changeId={{@setSelectedPrepositionalObjectId}}
          />
          <div class="input-buttons">
            <ValidationError
              @validatable={{this}}
              @property="prepositionalObjectId"
              data-test-validation-error
            />
            <button
              type="button"
              class="done text{{if this.prepositionalObjectIdMissing ' disabled'}}"
              {{on "click" (perform this.run)}}
              disabled={{this.run.isRunning}}
              data-test-run
            >
              {{t "general.runReport"}}
            </button>
            <button
              type="button"
              class="done text"
              {{on "click" (perform this.save)}}
              disabled={{this.save.isRunning}}
              data-test-save
            >
              {{#if this.save.isRunning}}
                <LoadingSpinner />
              {{else}}
                {{t "general.save"}}
              {{/if}}
            </button>
            <button type="button" class="cancel text" {{on "click" @close}} data-test-cancel>
              {{t "general.cancel"}}
            </button>
          </div>
        </div>
      </div>
    {{/let}}
  </template>
}
