import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { validatable, Length, NotBlank } from 'ilios-common/decorators/validation';
import { TrackedAsyncData } from 'ember-async-data';

@validatable
export default class LearnerGroupHeaderComponent extends Component {
  @tracked @NotBlank() @Length(3, 60) title;

  constructor() {
    super(...arguments);
    this.title = this.args.learnerGroup.title;
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
    this.title = this.args.learnerGroup.title;
  }

  changeTitle = dropTask(async () => {
    this.addErrorDisplayFor('title');
    const isValid = await this.isValid('title');
    if (!isValid) {
      return false;
    }
    this.removeErrorDisplayFor('title');
    this.args.learnerGroup.title = this.title;
    await this.args.learnerGroup.save();
  });
}

<header class="learner-group-header" data-test-learner-group-header ...attributes>
  <div class="header-bar">
    <span class="title">
      {{#if @canUpdate}}
        <EditableField
          data-test-title
          @value={{if this.title this.title (t "general.clickToEdit")}}
          @save={{perform this.changeTitle}}
          @close={{this.revertTitleChanges}}
          @saveOnEnter={{true}}
          @closeOnEscape={{true}}
          as |isSaving|
        >
          <input
            aria-label={{t "general.learnerGroupTitle"}}
            type="text"
            value={{this.title}}
            disabled={{isSaving}}
            {{on "input" (pick "target.value" (set this "title"))}}
            {{on "keyup" (fn this.addErrorDisplayFor "title")}}
          />
          <ValidationError @validatable={{this}} @property="title" />
        </EditableField>
      {{else}}
        <h2 data-test-title>{{this.title}}</h2>
      {{/if}}
    </span>
    <span class="info" data-test-members>
      {{t "general.members"}}:
      {{this.usersOnlyAtThisLevel.length}}
      /
      {{@learnerGroup.cohort.users.length}}
    </span>
  </div>
  <div class="breadcrumbs" data-test-breadcrumb>
    <span>
      <LinkTo
        @route="learner-groups"
        @query={{hash
          school=this.school.id
          program=this.program.id
          programYear=this.programYear.id
        }}
      >
        {{t "general.learnerGroups"}}
      </LinkTo>
    </span>
    {{#if @learnerGroup.allParents}}
      {{#each (reverse @learnerGroup.allParents) as |parent|}}
        <span>
          <LinkTo @route="learner-group" @model={{parent}} @query={{hash sortUsersBy=@sortUsersBy}}>
            {{parent.title}}
          </LinkTo>
        </span>
      {{/each}}
    {{/if}}
    <span>
      {{@learnerGroup.title}}
    </span>
  </div>
</header>