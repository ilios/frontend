<ul
  class="selected-term-tree"
  data-test-selected-term-tree
  data-test-selected-term-tree-level={{this.level}}
>
  <li class="clickable">
    <Dashboard::FilterCheckbox
      @checked={{includes @term.id @selectedTermIds}}
      @add={{fn @add @term.id}}
      @remove={{fn @remove @term.id}}
      @targetId={{@term.id}}
    >
      {{@term.title}}
    </Dashboard::FilterCheckbox>
    {{#each (sort-by "title" this.children) as |term|}}
      <Dashboard::SelectedTermTree
        @term={{term}}
        @selectedTermIds={{@selectedTermIds}}
        @add={{@add}}
        @remove={{@remove}}
        @level={{add this.level 1}}
      />
    {{/each}}
  </li>
</ul>