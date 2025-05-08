<div data-test-dashboard-selected-vocabulary>
  <h6 data-test-title>
    {{@vocabulary.title}}
  </h6>
  {{#each (sort-by "title" this.topLevelTerms) as |term|}}
    <Dashboard::SelectedTermTree
      @selectedTermIds={{@selectedTermIds}}
      @term={{term}}
      @add={{@add}}
      @remove={{@remove}}
    />
  {{/each}}
</div>