import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faLock } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import set from 'ember-set-helper/helpers/set';
import { string } from 'yup';

import YupValidations from '../../classes/yup-validations';
import pick from '../../helpers/pick';
import focus from '../../modifiers/focus';
import EditableField from '../editable-field';
import PublicationStatus from '../publication-status';
import YupValidationMessage from '../yup-validation-message';
import PublicationMenu from './publication-menu';

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

  changeTitle = task({ restartable: true }, async () => {
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
            @onEditingStatusChange={{set this "isEditingTitle"}}
            as |keyboard isSaving|
          >
            <input
              aria-label={{t "general.courseTitle"}}
              disabled={{isSaving}}
              type="text"
              value={{this.courseTitle}}
              {{on "input" (pick "target.value" (set this "courseTitle"))}}
              {{this.validations.attach "courseTitle"}}
              {{keyboard}}
              {{focus}}
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
              <FaIcon @icon={{faLock}} />
            {{/if}}
            {{@course.title}}
          </h2>
        {{/if}}
        {{#unless this.isEditingTitle}}
          <h2 class="academic-year" data-test-academic-year>
            {{@academicYear}}
          </h2>
        {{/unless}}
      </span>
      <div class="course-publication">
        {{#if @editable}}
          <PublicationMenu
            @course={{@course}}
            @showDetails={{@showDetails}}
            @setShowDetails={{@setShowDetails}}
          />
        {{else}}
          <PublicationStatus @item={{@course}} @showText={{true}} />
        {{/if}}
      </div>
    </div>
  </template>
}
