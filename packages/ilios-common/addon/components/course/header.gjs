import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { restartableTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class CourseHeaderComponent extends Component {
  @service iliosConfig;

  @Length(3, 200) @NotBlank() @tracked courseTitle;
  @tracked isEditingTitle = false;

  constructor() {
    super(...arguments);
    this.courseTitle = this.args.course.title;
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

  changeTitle = restartableTask(async () => {
    this.courseTitle = this.courseTitle.trim();
    this.addErrorDisplayFor('courseTitle');
    const isValid = await this.isValid('courseTitle');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('courseTitle');
    this.args.course.set('title', this.courseTitle);
    await this.args.course.save();
  });

  @action
  revertTitleChanges() {
    this.courseTitle = this.args.course.title;
  }
}

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
          {{on "keypress" (fn this.addErrorDisplayFor "courseTitle")}}
        />
        <ValidationError @validatable={{this}} @property="courseTitle" />
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
      <Course::PublicationMenu @course={{@course}} />
    {{else}}
      <PublicationStatus @item={{@course}} />
    {{/if}}
  </div>
</div>