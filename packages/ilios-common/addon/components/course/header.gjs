import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import { validatable } from 'ilios-common/decorators/validation';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { string } from 'yup';
import EditableField from 'ilios-common/components/editable-field';
import perform from 'ember-concurrency/helpers/perform';
import set from 'ember-set-helper/helpers/set';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import FaIcon from 'ilios-common/components/fa-icon';
import add from 'ember-math-helpers/helpers/add';
import PublicationMenu from 'ilios-common/components/course/publication-menu';
import PublicationStatus from 'ilios-common/components/publication-status';

@validatable
export default class CourseHeaderComponent extends Component {
  @service iliosConfig;

  @tracked courseTitle;
  @tracked isEditingTitle = false;

  constructor() {
    super(...arguments);
    this.courseTitle = this.args.course.title;
  }

  validations = new YupValidations(this, {
    courseTitle: string().ensure().trim().min(3).max(200),
  });

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

  changeTitle = restartableTask(async () => {
    this.courseTitle = this.courseTitle.trim();
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay('courseTitle');
    this.args.course.set('title', this.courseTitle);
    await this.args.course.save();
  });

  @action
  revertTitleChanges() {
    this.courseTitle = this.args.course.title;
    this.validations.clearErrorDisplay('courseTitle');
  }
  <template>
    <div class="course-header" data-test-course-header>
      <span class="title" data-test-title>
        {{#if @editable}}
          <EditableField
            @value={{this.courseTitle}}
            @save={{perform this.changeTitle}}
            @close={{this.revertTitleChanges}}
            @saveOnEnter={{true}}
            @onEditingStatusChange={{set this "isEditingTitle"}}
            @closeOnEscape={{true}}
            as |isSaving|
          >
            <input
              aria-label={{t "general.courseTitle"}}
              disabled={{isSaving}}
              type="text"
              value={{this.courseTitle}}
              {{on "input" (pick "target.value" (set this "courseTitle"))}}
              {{this.validations.attach "courseTitle"}}
            />
            <YupValidationMessage
              @description={{t "general.title"}}
              @validationErrors={{this.validations.errors.courseTitle}}
              data-test-title-validation-error-message
            />
          </EditableField>
        {{else}}
          <h2>
            {{#if @course.locked}}
              <FaIcon @icon="lock" />
            {{/if}}
            {{@course.title}}
          </h2>
        {{/if}}
        {{#unless this.isEditingTitle}}
          <h3 class="academic-year" data-test-academic-year>
            {{#if this.academicYearCrossesCalendarYearBoundaries}}
              {{@course.year}}
              -
              {{add @course.year 1}}
            {{else}}
              {{@course.year}}
            {{/if}}
          </h3>
        {{/unless}}
      </span>
      <div class="course-publication">
        {{#if @editable}}
          <PublicationMenu @course={{@course}} />
        {{else}}
          <PublicationStatus @item={{@course}} />
        {{/if}}
      </div>
    </div>
  </template>
}
