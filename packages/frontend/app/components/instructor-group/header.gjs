import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import EditableField from 'ilios-common/components/editable-field';
import perform from 'ember-concurrency/helpers/perform';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
import focus from 'ilios-common/modifiers/focus';

export default class InstructorGroupHeaderComponent extends Component {
  @service store;
  @tracked title;

  constructor() {
    super(...arguments);
    this.title = this.args.instructorGroup.title;
  }

  validations = new YupValidations(this, {
    title: string().ensure().trim().min(3).max(60),
  });

  changeTitle = task({ drop: true }, async () => {
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
  <template>
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
              as |keyboard isSaving|
            >
              <input
                aria-label={{t "general.instructorGroupTitle"}}
                type="text"
                value={{this.title}}
                disabled={{isSaving}}
                {{on "input" (pick "target.value" (set this "title"))}}
                {{this.validations.attach "title"}}
                {{keyboard}}
                {{focus}}
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
  </template>
}
