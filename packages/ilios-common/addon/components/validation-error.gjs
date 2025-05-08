{{#each this.errors as |message|}}
  <span class="validation-error-message" ...attributes>
    {{message}}
  </span>
{{/each}}