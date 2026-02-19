import Component from '@glimmer/component';
import { service } from '@ember/service';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { findById } from 'ilios-common/utils/array-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string, date } from 'yup';
import { DateTime } from 'luxon';
import { uniqueId, hash, fn, concat } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import EditableField from 'ilios-common/components/editable-field';
import perform from 'ember-concurrency/helpers/perform';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import isEmpty from 'ember-truth-helpers/helpers/is-empty';
import sortBy from 'ilios-common/helpers/sort-by';
import { eq } from 'ember-truth-helpers';
import formatDate from 'ember-intl/helpers/format-date';
import DatePicker from 'ilios-common/components/date-picker';
import pipe from 'ilios-common/helpers/pipe';
import focus from 'ilios-common/modifiers/focus';
import { faBoxArchive, faChartColumn, faPrint, faShuffle } from '@fortawesome/free-solid-svg-icons';

export default class CourseOverview extends Component {
  @service currentUser;
  @service intl;
  @service permissionChecker;
  @service router;
  @service store;

  universalLocator = 'ILIOS';

  @tracked externalId = null;
  @tracked startDate = null;
  @tracked endDate = null;
  @tracked level = null;
  @tracked levelOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  @tracked clerkshipTypeId;
  @tracked clerkshipTypeOptions;

  constructor() {
    super(...arguments);
    const { course } = this.args;
    this.clerkshipTypeOptions = this.store.peekAll('course-clerkship-type');
    this.externalId = course.externalId;
    this.startDate = course.startDate;
    this.endDate = course.endDate;
    this.level = course.level;
    this.clerkshipTypeId = course.belongsTo('clerkshipType').id();
  }

  validations = new YupValidations(this, {
    externalId: string()
      .transform((value) => (value === '' ? null : value))
      .nullable()
      .min(2)
      .max(255),
    startDate: date()
      .required()
      .test(
        'is-before-end-date',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.before',
            values: {
              before: this.intl.t('general.endDate'),
            },
          };
        },
        (value) => {
          const startDate = DateTime.fromJSDate(value);
          const endDate = DateTime.fromJSDate(this.endDate);
          return startDate.startOf('day') < endDate.startOf('day');
        },
      ),
    endDate: date()
      .required()
      .test(
        'is-after-start-date',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.after',
            values: {
              after: this.intl.t('general.startDate'),
            },
          };
        },
        (value) => {
          const endDate = DateTime.fromJSDate(value);
          const startDate = DateTime.fromJSDate(this.startDate);
          return startDate.startOf('day') < endDate.startOf('day');
        },
      ),
  });

  @cached
  get schoolData() {
    return new TrackedAsyncData(this.args.course.school);
  }

  @cached
  get canCreateCourseInSchoolData() {
    return new TrackedAsyncData(this.permissionChecker.canCreateCourse(this.schoolData.value));
  }

  get canCreateCourseInSchool() {
    return this.schoolData.isResolved && this.canCreateCourseInSchoolData.isResolved
      ? this.canCreateCourseInSchoolData.value
      : false;
  }

  get selectedClerkshipType() {
    if (!this.clerkshipTypeId) {
      return null;
    }

    return findById(this.clerkshipTypeOptions, this.clerkshipTypeId);
  }

  get showRollover() {
    if (this.router.currentRouteName === 'course.rollover') {
      return false;
    }

    return !this.args.course.locked && this.canCreateCourseInSchool;
  }

  get clerkshipTypeTitle() {
    if (!this.selectedClerkshipType) {
      return this.intl.t('general.notAClerkship');
    }

    return this.selectedClerkshipType.title;
  }
  @action
  async changeClerkshipType() {
    this.args.course.set('clerkshipType', this.selectedClerkshipType);
    return this.args.course.save();
  }

  @action
  setCourseClerkshipType(event) {
    let id = event.target.value;
    //convert the string 'null' to a real null
    if (id === 'null') {
      id = null;
    }
    this.clerkshipTypeId = id;
  }

  revertClerkshipTypeChanges = task({ restartable: true }, async () => {
    const clerkshipType = await this.args.course.clerkshipType;
    if (clerkshipType) {
      this.clerkshipTypeId = clerkshipType.id;
    } else {
      this.clerkshipTypeId = null;
    }
  });

  changeStartDate = task({ restartable: true }, async () => {
    this.validations.addErrorDisplayFor('startDate');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('startDate');
    this.args.course.set('startDate', this.startDate);
    await this.args.course.save();
    this.startDate = this.args.course.startDate;
  });

  @action
  revertStartDateChanges() {
    this.validations.removeErrorDisplayFor('startDate');
    this.startDate = this.args.course.startDate;
  }

  changeEndDate = task({ restartable: true }, async () => {
    this.validations.addErrorDisplayFor('endDate');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('endDate');
    this.args.course.set('endDate', this.endDate);
    await this.args.course.save();
    this.endDate = this.args.course.endDate;
  });

  @action
  revertEndDateChanges() {
    this.validations.removeErrorDisplayFor('endDate');
    this.endDate = this.args.course.endDate;
  }

  changeExternalId = task({ restartable: true }, async () => {
    this.validations.addErrorDisplayFor('externalId');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('externalId');
    this.args.course.set('externalId', this.externalId);
    await this.args.course.save();
    this.externalId = this.args.course.externalId;
  });

  @action
  revertExternalIdChanges() {
    this.externalId = this.args.course.externalId;
  }

  @action
  setLevel(event) {
    this.level = parseInt(event.target.value, 10);
  }

  @action
  async changeLevel() {
    this.args.course.set('level', this.level);
    return this.args.course.save();
  }

  @action
  revertLevelChanges() {
    this.level = this.args.course.level;
  }
  <template>
    <section class="course-overview" data-test-course-overview>
      {{#let (uniqueId) as |templateId|}}
        <div class="course-overview-header">
          <div class="title">
            {{t "general.overview"}}
          </div>
          <div class="course-overview-actions">
            <LinkTo
              @route="course-materials"
              @model={{@course}}
              class="materials"
              title={{t "general.learningMaterialsSummary"}}
            >
              <FaIcon @icon={{faBoxArchive}} @fixedWidth={{true}} />
            </LinkTo>
            <LinkTo
              @route="print-course"
              @model={{@course}}
              @query={{hash unpublished=true}}
              title={{t "general.printSummary"}}
              class="print"
            >
              <FaIcon @icon={{faPrint}} @fixedWidth={{true}} />
            </LinkTo>
            {{#if this.showRollover}}
              <LinkTo
                @route="course.rollover"
                @model={{@course}}
                class="rollover"
                title={{t "general.courseRollover"}}
              >
                <FaIcon @icon={{faShuffle}} @fixedWidth={{true}} />
              </LinkTo>
            {{/if}}
            <LinkTo
              @route="course-visualizations"
              @model={{@course}}
              title={{t "general.courseVisualizations"}}
            >
              <FaIcon @icon={{faChartColumn}} />
            </LinkTo>
          </div>
        </div>
        <div class="course-overview-content">
          <div class="block courseexternalid">
            <label for="external-id-{{templateId}}">{{t "general.externalId"}}:</label>
            <span>
              {{#if @editable}}
                <EditableField
                  @value={{if this.externalId this.externalId (t "general.clickToEdit")}}
                  @save={{perform this.changeExternalId}}
                  @close={{this.revertExternalIdChanges}}
                  as |keyboard isSaving|
                >
                  <input
                    id="external-id-{{templateId}}"
                    disabled={{isSaving}}
                    type="text"
                    value={{this.externalId}}
                    {{on "input" (pick "target.value" (set this "externalId"))}}
                    {{this.validations.attach "externalId"}}
                    {{keyboard}}
                    {{focus}}
                  />
                  <YupValidationMessage
                    @description={{t "general.externalId"}}
                    @validationErrors={{this.validations.errors.externalId}}
                  />
                </EditableField>
              {{else}}
                {{this.externalId}}&nbsp;
              {{/if}}
            </span>
          </div>
          <div class="block clerkshiptype">
            <label for="clerkship-type-{{templateId}}">{{t "general.clerkshipType"}}:</label>
            <span>
              {{#if @editable}}
                <EditableField
                  @value={{this.clerkshipTypeTitle}}
                  @save={{this.changeClerkshipType}}
                  @close={{perform this.revertClerkshipTypeChanges}}
                >
                  <select
                    id="clerkship-type-{{templateId}}"
                    {{on "change" this.setCourseClerkshipType}}
                    {{focus}}
                  >
                    <option value="null" selected={{isEmpty this.selectedClerkshipType}}>
                      {{t "general.notAClerkship"}}
                    </option>
                    {{#each (sortBy "title" this.clerkshipTypeOptions) as |clerkshipType|}}
                      <option
                        value={{clerkshipType.id}}
                        selected={{eq clerkshipType this.selectedClerkshipType}}
                      >
                        {{clerkshipType.title}}
                      </option>
                    {{/each}}
                  </select>
                </EditableField>
              {{else if @course.clerkshipType}}
                {{@course.clerkshipType.title}}
              {{else}}
                {{t "general.notAClerkship"}}
              {{/if}}
            </span>
          </div>
          <div class="block coursestartdate">
            <label>{{t "general.startDate"}}:</label>
            <span>
              {{#if @editable}}
                <EditableField
                  @value={{formatDate
                    @course.startDate
                    day="2-digit"
                    month="2-digit"
                    year="numeric"
                  }}
                  @save={{perform this.changeStartDate}}
                  @close={{this.revertStartDateChanges}}
                >
                  <DatePicker
                    @value={{this.startDate}}
                    @onChange={{pipe
                      (set this "startDate")
                      (fn this.validations.addErrorDisplayFor "startDate")
                    }}
                    @autofocus={{true}}
                  />
                </EditableField>
                <YupValidationMessage
                  @description={{t "general.startDate"}}
                  @validationErrors={{this.validations.errors.startDate}}
                />
              {{else}}
                {{formatDate @course.startDate day="2-digit" month="2-digit" year="numeric"}}&nbsp;
              {{/if}}
            </span>
          </div>
          <div class="block courseenddate">
            <label>{{t "general.endDate"}}:</label>
            <span>
              {{#if @editable}}
                <EditableField
                  @value={{formatDate @course.endDate day="2-digit" month="2-digit" year="numeric"}}
                  @save={{perform this.changeEndDate}}
                  @close={{this.revertEndDateChanges}}
                >
                  <DatePicker
                    @value={{this.endDate}}
                    @onChange={{pipe
                      (set this "endDate")
                      (fn this.validations.addErrorDisplayFor "endDate")
                    }}
                    @autofocus={{true}}
                  />
                </EditableField>
                <YupValidationMessage
                  @description={{t "general.endDate"}}
                  @validationErrors={{this.validations.errors.endDate}}
                />
              {{else}}
                {{formatDate @course.endDate day="2-digit" month="2-digit" year="numeric"}}&nbsp;
              {{/if}}
            </span>
          </div>
          <div class="block courselevel">
            <label for="level-{{templateId}}">{{t "general.level"}}:</label>
            <span>
              {{#if @editable}}
                <EditableField
                  @value={{this.level}}
                  @save={{this.changeLevel}}
                  @close={{this.revertLevelChanges}}
                >
                  <select id="level-{{templateId}}" {{on "change" this.setLevel}} {{focus}}>
                    {{#each this.levelOptions as |levelOption|}}
                      <option value={{levelOption}} selected={{eq levelOption this.level}}>
                        {{levelOption}}
                      </option>
                    {{/each}}
                  </select>
                </EditableField>
              {{else}}
                {{this.level}}&nbsp;
              {{/if}}
            </span>
          </div>
          <div class="block">
            <label>{{t "general.universalLocator"}}:</label>
            <span class="universallocator">
              <strong>
                {{concat this.universalLocator @course.id}}
              </strong>
            </span>
          </div>
        </div>
      {{/let}}
    </section>
  </template>
}
