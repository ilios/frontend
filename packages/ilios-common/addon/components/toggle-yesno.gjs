<button
  aria-checked="{{if this.yes 'true' 'false'}}"
  aria-label="{{if this.yes (t 'general.yes') (t 'general.no')}}"
  class="toggle-yesno {{if this.yes 'yes' 'no'}}"
  data-test-toggle-yesno
  role="switch"
  type="button"
  {{on "click" this.click}}
>
  <span class="switch-handle" data-test-handle>
    {{#if this.yes}}
      <FaIcon role="presentation" @icon="plus" />
    {{else}}
      <FaIcon role="presentation" @icon="minus" />
    {{/if}}
  </span>
</button>