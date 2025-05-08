import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class InstructorGroupHeaderComponent extends Component {
  @service store;
  @tracked title;

  constructor() {
    super(...arguments);
    this.title = this.args.instructorGroup.title;
  }

  validations = new YupValidations(this, {
    title: string().required().min(3).max(60),
  });

  changeTitle = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    this.args.instructorGroup.title = this.title;
    await this.args.instructorGroup.save();
    this.title = this.args.instructorGroup.title;
  });

  @action
  revertTitleChanges() {
    this.title = this.args.instructorGroup.title;
  }
}

<div class="instructor-group-header" data-test-instructor-group-header ...attributes>
  {{! template-lint-disable no-bare-strings }}
  <div class="header-bar">
    <span class="title">
      {{#if @canUpdate}}
        <EditableField
          data-test-title
          @value={{this.title}}
          @save={{perform this.changeTitle}}
          @close={{this.revertTitleChanges}}
          @saveOnEnter={{true}}
          @closeOnEscape={{true}}
          as |isSaving|
        >
          <input
            aria-label={{t "general.instructorGroupTitle"}}
            type="text"
            value={{this.title}}
            disabled={{isSaving}}
            {{on "input" (pick "target.value" (set this "title"))}}
            {{this.validations.attach "title"}}
          />
          <YupValidationMessage
            @description={{t "general.title"}}
            @validationErrors={{this.validations.errors.title}}
            data-test-title-validation-error-message
          />
        </EditableField>
      {{else}}
        <h2 data-test-title>
          {{this.title}}
        </h2>
      {{/if}}
    </span>
    <span class="info" data-test-members>
      {{t "general.members"}}:
      {{@instructorGroup.users.length}}
    </span>
  </div>
  <div class="breadcrumbs" data-test-breadcrumb>
    <span>
      <LinkTo @route="instructor-groups">
        {{t "general.instructorGroups"}}
      </LinkTo>
    </span>
    <span>
      <LinkTo @route="instructor-groups" @query={{hash schoolId=@instructorGroup.school.id}}>
        {{@instructorGroup.school.title}}
      </LinkTo>
    </span>
    <span>
      {{@instructorGroup.title}}
    </span>
  </div>
</div>