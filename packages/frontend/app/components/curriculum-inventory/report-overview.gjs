import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { date, string } from 'yup';
import { DateTime } from 'luxon';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { on } from '@ember/modifier';
import EditableField from 'ilios-common/components/editable-field';
import formatDate from 'ember-intl/helpers/format-date';
import perform from 'ember-concurrency/helpers/perform';
import DatePicker from 'ilios-common/components/date-picker';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
import pick from 'ilios-common/helpers/pick';
import eq from 'ember-truth-helpers/helpers/eq';
import focus from 'ilios-common/modifiers/focus';
import { faShuffle, faTable } from '@fortawesome/free-solid-svg-icons';

export default class CurriculumInventoryReportOverviewComponent extends Component {
  @service currentUser;
  @service iliosConfig;
  @service permissionChecker;
  @service router;
  @service intl;

  @tracked description;
  @tracked startDate;
  @tracked endDate;
  @tracked year;

  constructor() {
    super(...arguments);
    this.description = this.args.report.description;
    this.year = this.args.report.year;
    this.startDate = this.args.report.startDate;
    this.endDate = this.args.report.endDate;
  }

  validations = new YupValidations(this, {
    description: string().trim().required().max(21844),
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
  get courseData() {
    return new TrackedAsyncData(this.args.report.getLinkedCourses());
  }

  get linkedCourses() {
    return this.courseData.isResolved ? this.courseData.value : null;
  }

  get linkedCoursesLoaded() {
    return this.courseData.isResolved;
  }

  @cached
  get hasLinkedCourses() {
    return Boolean(this.linkedCourses?.length);
  }

  @cached
  get canRolloverData() {
    return new TrackedAsyncData(this.getCanRollover(this.args.report));
  }

  get canRollover() {
    return this.canRolloverData.isResolved ? this.canRolloverData.value : false;
  }

  async getCanRollover(report) {
    const program = await report.program;
    const school = await program.school;
    return await this.permissionChecker.canCreateCurriculumInventoryReport(school);
  }

  get showRollover() {
    if (this.router.currentRouteName === 'curriculum-inventory-report.rollover') {
      return false;
    }

    return this.canRollover;
  }

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }

  get yearOptions() {
    const currentYear = new Date().getFullYear();
    const rhett = [];
    for (let i = currentYear - 5, n = currentYear + 5; i <= n; i++) {
      rhett.push({
        id: `${i}`,
        title: this.academicYearCrossesCalendarYearBoundaries ? `${i} - ${i + 1}` : `${i}`,
      });
    }
    return rhett;
  }

  get yearLabel() {
    if (this.academicYearCrossesCalendarYearBoundaries) {
      return this.year + ' - ' + (parseInt(this.year, 10) + 1);
    }
    return this.year;
  }

  changeStartDate = task({ drop: true }, async () => {
    this.validations.addErrorDisplayFor('startDate');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('startDate');
    this.args.report.startDate = this.startDate;
    await this.args.report.save();
  });

  @action
  revertStartDateChanges() {
    this.validations.removeErrorDisplayFor('startDate');
    this.startDate = this.args.report.get.startDate;
  }

  changeEndDate = task({ drop: true }, async () => {
    this.validations.addErrorDisplayFor('endDate');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('endDate');
    this.args.report.endDate = this.endDate;
    await this.args.report.save();
  });

  @action
  revertEndDateChanges() {
    this.validations.removeErrorDisplayFor('endDate');
    this.endDate = this.args.report.endDate;
  }

  changeYear = task({ drop: true }, async () => {
    this.args.report.year = this.year;
    await this.args.report.save();
  });

  @action
  revertYearChanges() {
    this.year = this.args.report.year;
  }

  changeDescription = task({ drop: true }, async () => {
    this.validations.addErrorDisplayFor('description');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('description');
    this.args.report.description = this.description;
    await this.args.report.save();
  });

  @action
  revertDescriptionChanges() {
    this.validations.removeErrorDisplayFor('description');
    this.description = this.args.report.description;
  }

  @action
  transitionToRollover() {
    this.router.transitionTo('curriculum-inventory-report.rollover', this.args.report);
  }
  <template>
    <section
      class="curriculum-inventory-report-overview"
      data-test-curriculum-inventory-report-overview
      ...attributes
    >
      {{#let (uniqueId) as |templateId|}}
        <div class="report-overview-header">
          <div class="title" data-test-title>
            {{t "general.overview"}}
          </div>
          <div class="report-overview-actions">
            <LinkTo
              @route="verification-preview"
              @model={{@report}}
              class="verification-preview"
              title={{t "general.verificationPreviewFor" name=@report.name}}
              data-test-transition-to-verification-preview
            >
              <FaIcon @icon={{faTable}} @fixedWidth={{true}} />
            </LinkTo>
            {{#if this.showRollover}}
              <button
                class="link-button rollover"
                type="button"
                aria-label={{t "general.curriculumInventoryReportRollover"}}
                {{on "click" this.transitionToRollover}}
                data-test-transition-to-rollover
              >
                <FaIcon
                  @icon={{faShuffle}}
                  @fixedWidth={{true}}
                  @title={{t "general.curriculumInventoryReportRollover"}}
                />
              </button>
            {{/if}}
          </div>
        </div>
        <div class="curriculum-inventory-report-overview-content">
          <div class="block start-date" data-test-start-date>
            <label>
              {{t "general.startDate"}}:
            </label>
            <span>
              {{#if @canUpdate}}
                <EditableField
                  @value={{formatDate
                    @report.startDate
                    day="2-digit"
                    month="2-digit"
                    year="numeric"
                  }}
                  @save={{perform this.changeStartDate}}
                  @close={{this.revertStartDateChanges}}
                >
                  <DatePicker
                    @value={{this.startDate}}
                    @onChange={{set this "startDate"}}
                    @autofocus={{true}}
                    {{this.validations.attach "startDate"}}
                    data-test-start-date-picker
                  />
                </EditableField>
                <YupValidationMessage
                  @description={{t "general.startDate"}}
                  @validationErrors={{this.validations.errors.startDate}}
                  data-test-start-date-validation-error-message
                />
              {{else}}
                {{formatDate @report.startDate day="2-digit" month="2-digit" year="numeric"}}
              {{/if}}
            </span>
          </div>
          <div class="block end-date" data-test-end-date>
            <label>
              {{t "general.endDate"}}:
            </label>
            <span>
              {{#if @canUpdate}}
                <EditableField
                  @value={{formatDate @report.endDate day="2-digit" month="2-digit" year="numeric"}}
                  @save={{perform this.changeEndDate}}
                  @close={{this.revertEndDateChanges}}
                >
                  <DatePicker
                    @value={{this.endDate}}
                    @onChange={{set this "endDate"}}
                    @autofocus={{true}}
                    {{this.validations.attach "endDate"}}
                    data-test-end-date-picker
                  />
                </EditableField>
                <YupValidationMessage
                  @description={{t "general.endDate"}}
                  @validationErrors={{this.validations.errors.endDate}}
                  data-test-end-date-validation-error-message
                />
              {{else}}
                {{formatDate @report.endDate day="2-digit" month="2-digit" year="numeric"}}
              {{/if}}
            </span>
          </div>
          <div class="block academic-year" data-test-academic-year>
            <label for="year-{{templateId}}">
              {{t "general.academicYear"}}:
            </label>
            {{#if this.linkedCoursesLoaded}}
              {{#if (and @canUpdate (not this.hasLinkedCourses))}}
                <EditableField
                  @value={{this.yearLabel}}
                  @save={{perform this.changeYear}}
                  @close={{this.revertYearChanges}}
                >
                  <select
                    id="year-{{templateId}}"
                    {{on "change" (pick "target.value" (set this "year"))}}
                    {{focus}}
                  >
                    {{#each this.yearOptions as |obj|}}
                      <option
                        value={{obj.id}}
                        selected={{eq obj.id this.year}}
                      >{{obj.title}}</option>
                    {{/each}}
                  </select>
                </EditableField>
              {{else}}
                <span>
                  {{this.yearLabel}}
                </span>
              {{/if}}
            {{/if}}
          </div>
          <div class="block program" data-test-program>
            <label>
              {{t "general.program"}}:
            </label>
            <span>
              {{@report.program.title}}
              {{#if @report.program.shortTitle}}
                ({{@report.program.shortTitle}})
              {{/if}}
            </span>
          </div>
          <div class="description" data-test-description>
            <label for="description-{{templateId}}">
              {{t "general.description"}}:
            </label>
            <span>
              {{#if @canUpdate}}
                <EditableField
                  @value={{this.description}}
                  @save={{perform this.changeDescription}}
                  @close={{this.revertDescriptionChanges}}
                  @clickPrompt={{if this.description this.description (t "general.clickToEdit")}}
                  as |keyboard isSaving|
                >
                  <textarea
                    id="description-{{templateId}}"
                    value={{this.description}}
                    disabled={{isSaving}}
                    {{on "input" (pick "target.value" (set this "description"))}}
                    {{this.validations.attach "description"}}
                    placeholder={{t "general.reportDescriptionPlaceholder"}}
                    {{keyboard saveOnEnter=false}}
                    {{focus}}
                  >
                    {{this.description}}
                  </textarea>
                </EditableField>
                <YupValidationMessage
                  @description={{t "general.description"}}
                  @validationErrors={{this.validations.errors.description}}
                  data-test-description-validation-error-message
                />
              {{else}}
                {{this.description}}
              {{/if}}
            </span>
          </div>
        </div>
      {{/let}}
    </section>
  </template>
}
