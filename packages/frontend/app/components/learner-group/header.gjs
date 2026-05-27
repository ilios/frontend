import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { array, hash } from '@ember/helper';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import EditableField from 'ilios-common/components/editable-field';
import { eq } from 'ember-truth-helpers';
import t from 'ember-intl/helpers/t';
import perform from 'ember-concurrency/helpers/perform';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import { LinkTo } from '@ember/routing';
import reverse from 'ilios-common/helpers/reverse';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { string } from 'yup';
import Breadcrumbs from 'ilios-common/components/breadcrumbs';
import focus from 'ilios-common/modifiers/focus';

export default class LearnerGroupHeaderComponent extends Component {
  @service intl;
  @tracked titleBuffer;

  validations = new YupValidations(this, {
    title: string().trim().min(3).max(60),
  });

  get title() {
    return this.titleBuffer ?? this.args.learnerGroup.title;
  }

  @cached
  get upstreamRelationshipsData() {
    return new TrackedAsyncData(this.resolveUpstreamRelationships(this.args.learnerGroup));
  }

  get upstreamRelationships() {
    return this.upstreamRelationshipsData.isResolved ? this.upstreamRelationshipsData.value : null;
  }

  get programYear() {
    return this.upstreamRelationships?.programYear;
  }

  get program() {
    return this.upstreamRelationships?.program;
  }

  get school() {
    return this.upstreamRelationships?.school;
  }

  get programAndYear() {
    return `${this.program.title} ${this.programYear.cohort.get('title')}`;
  }

  get usersOnlyAtThisLevel() {
    return this.args.learnerGroup.usersOnlyAtThisLevel
      ? this.args.learnerGroup.usersOnlyAtThisLevel
      : [];
  }

  async resolveUpstreamRelationships(learnerGroup) {
    const cohort = await learnerGroup.cohort;
    const programYear = await cohort.programYear;
    const program = await programYear.program;
    const school = await program.school;

    return { cohort, programYear, program, school };
  }

  @action
  revertTitleChanges() {
    this.validations.removeErrorDisplayFor('title');
    this.titleBuffer = null;
  }

  changeTitle = task({ drop: true }, async () => {
    this.validations.addErrorDisplayFor('title');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.removeErrorDisplayFor('title');
    this.args.learnerGroup.title = this.title;
    await this.args.learnerGroup.save();
    this.titleBuffer = null;
  });
  <template>
    <header class="learner-group-header" data-test-learner-group-header ...attributes>
      <div class="header-bar">
        <span class="title">
          {{#if @canUpdate}}
            <EditableField
              data-test-title
              @value={{if @learnerGroup.title @learnerGroup.title (t "general.clickToEdit")}}
              @save={{perform this.changeTitle}}
              @close={{this.revertTitleChanges}}
              as |keyboard isSaving|
            >
              <input
                aria-label={{t "general.learnerGroupTitle"}}
                type="text"
                value={{this.title}}
                disabled={{isSaving}}
                {{on "input" (pick "target.value" (set this "titleBuffer"))}}
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
            <h2 data-test-title>{{@learnerGroup.title}}</h2>
          {{/if}}
        </span>
        <span class="info" data-test-members>
          {{t "general.members"}}:
          {{this.usersOnlyAtThisLevel.length}}
          /
          {{@learnerGroup.cohort.users.length}}
        </span>
      </div>

      {{#if this.upstreamRelationshipsData.isResolved}}
        <Breadcrumbs
          @paths={{array
            (hash
              route="learner-groups"
              title=(t "general.learnerGroups")
              query=(hash
                school=this.school.id program=this.program.id programYear=this.programYear.id
              )
            )
            (hash
              route="learner-groups"
              title=this.programAndYear
              query=(hash
                school=this.school.id program=this.program.id programYear=this.programYear.id
              )
            )
            (hash)
          }}
          @rootTitle={{@learnerGroup.title}}
          as |path index|
        >
          {{#if (eq index 2)}}
            {{#if @learnerGroup.allParents}}
              {{#each (reverse @learnerGroup.allParents) as |parent|}}
                <LinkTo
                  @route="learner-group"
                  @model={{parent}}
                  @query={{hash sortUsersBy=@sortUsersBy}}
                  class="crumb"
                  data-test-crumb
                >
                  {{parent.title}}
                </LinkTo>
              {{/each}}
            {{/if}}
          {{else}}
            <LinkTo @route={{path.route}} @query={{path.query}} class="crumb" data-test-crumb>
              {{path.title}}
            </LinkTo>
          {{/if}}
        </Breadcrumbs>
      {{/if}}
    </header>
  </template>
}
