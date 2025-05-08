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