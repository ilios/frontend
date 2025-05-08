{{#if (and this.isEnabled this.isSessionLearningMaterial this.isStatusLoaded)}}
  <span class="user-material-status" data-test-user-material-status>
    {{#if (eq this.status 0)}}
      <input
        aria-label={{t "general.notStarted"}}
        type="checkbox"
        disabled={{@disabled}}
        {{on "click" (perform this.setStatus 1)}}
      />
    {{else if (eq this.status 1)}}
      <input
        aria-label={{t "general.inProgress"}}
        indeterminate={{true}}
        type="checkbox"
        disabled={{@disabled}}
        {{on "click" (perform this.setStatus 2)}}
      />
    {{else if (eq this.status 2)}}
      <input
        aria-label={{t "general.complete"}}
        checked={{true}}
        type="checkbox"
        disabled={{@disabled}}
        {{on "click" (perform this.setStatus 0)}}
      />
    {{/if}}
  </span>
{{/if}}