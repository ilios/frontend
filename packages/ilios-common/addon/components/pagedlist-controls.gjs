{{#let (unique-id) as |templateId|}}
  <div class="pagedlist-controls" data-test-pagedlist-controls ...attributes>
    {{#unless @limitless}}
      <button
        class="link-button backward"
        type="button"
        title={{t "general.first"}}
        disabled={{this.firstPage}}
        data-test-go-to-first
        {{on "click" this.goToFirst}}
      >
        <FaIcon @icon="backward-fast" class={{if this.firstPage "disabled"}} />
      </button>
    {{/unless}}
    <button
      class="link-button backward"
      type="button"
      title={{t "general.previous"}}
      disabled={{this.firstPage}}
      data-test-go-to-previous
      {{on "click" this.goBack}}
    >
      <FaIcon @icon="play" @flip="horizontal" class={{if this.firstPage "disabled"}} />
    </button>
    {{#if @limitless}}
      <select
        aria-labelledby="per-page-{{templateId}}"
        {{on "change" (pick "target.value" this.setLimit)}}
        data-test-limits
      >
        {{#each this.offsetOptions as |o|}}
          <option value={{o}} selected={{is-equal o this.limit}} data-test-limit>
            {{o}}
          </option>
        {{/each}}
      </select>
      <span id="per-page-{{templateId}}">{{t "general.perPage"}}</span>
    {{else}}
      <span data-test-paged-results-count>
        {{t "general.pagedResultsCount" start=this.start end=this.end total=this.total}}
      </span>
    {{/if}}
    <button
      class="link-button forward"
      type="button"
      title={{t "general.next"}}
      disabled={{this.lastPage}}
      data-test-go-to-next
      {{on "click" this.goForward}}
    >
      <FaIcon @icon="play" class={{if this.lastPage "disabled"}} />
    </button>
    {{#unless @limitless}}
      <button
        class="link-button forward"
        type="button"
        title={{t "general.last"}}
        disabled={{this.lastPage}}
        data-test-go-to-last
        {{on "click" this.goToLast}}
      >
        <FaIcon @icon="forward-fast" class={{if this.lastPage "disabled"}} />
      </button>
      <select
        aria-labelledby="per-page-{{templateId}}"
        {{on "change" (pick "target.value" this.setLimit)}}
        data-test-limits
      >
        {{#each this.offsetOptions as |o|}}
          <option value={{o}} selected={{is-equal o this.limit}} data-test-limit>
            {{o}}
          </option>
        {{/each}}
      </select>
      <span id="per-page-{{templateId}}">{{t "general.perPage"}}</span>
    {{/unless}}
  </div>
{{/let}}