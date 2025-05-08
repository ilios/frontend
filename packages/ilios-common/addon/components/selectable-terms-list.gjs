<ul
  class="selectable-terms-list"
  data-test-selectable-terms-list
  data-test-selectable-terms-list-level={{this.level}}
>
  {{#each (sort-by "title" this.terms) as |term|}}
    {{#if term.active}}
      <li class="nested">
        <SelectableTermsListItem
          @selectedTerms={{@selectedTerms}}
          @term={{term}}
          @add={{@add}}
          @remove={{@remove}}
          @level={{this.level}}
        />
        {{#if term.hasChildren}}
          <SelectableTermsList
            @selectedTerms={{@selectedTerms}}
            @parent={{term}}
            @add={{@add}}
            @remove={{@remove}}
            @termFilter={{@termFilter}}
            @level={{add this.level 1}}
          />
        {{/if}}
      </li>
    {{/if}}
  {{/each}}
</ul>