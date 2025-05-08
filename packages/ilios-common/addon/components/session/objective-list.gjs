<div class="session-objective-list" data-test-session-objective-list>
  {{#if this.isSorting}}
    <ObjectiveSortManager @subject={{@session}} @close={{set this "isSorting" false}} />
  {{/if}}

  {{#if (and this.sessionObjectiveCount (not this.isSorting))}}
    {{#if (and @editable (gt this.sessionObjectiveCount 1))}}
      <button
        class="sort-button"
        type="button"
        {{on "click" (set this "isSorting" true)}}
        data-test-sort
      >
        {{t "general.sortObjectives"}}
      </button>
    {{/if}}
    <div class="grid-row headers" data-test-headers>
      <span class="grid-item" data-test-header>{{t "general.description"}}</span>
      <span class="grid-item" data-test-header>{{t "general.parentObjectives"}}</span>
      <span class="grid-item" data-test-header>{{t "general.vocabularyTerms"}}</span>
      <span class="grid-item" data-test-header>{{t "general.meshTerms"}}</span>
      <span class="actions grid-item" data-test-header>{{t "general.actions"}}</span>
    </div>
    {{#if (and (is-array this.sessionObjectives) (is-array this.courseObjectives))}}
      {{#each this.sessionObjectives as |sessionObjective|}}
        <Session::ObjectiveListItem
          @sessionObjective={{sessionObjective}}
          @editable={{@editable}}
          @courseObjectives={{this.courseObjectives}}
          @courseTitle={{this.course.title}}
          @session={{@session}}
        />
      {{/each}}
    {{else}}
      <Session::ObjectiveListLoading @count={{this.sessionObjectiveCount}} />
    {{/if}}
  {{/if}}
</div>