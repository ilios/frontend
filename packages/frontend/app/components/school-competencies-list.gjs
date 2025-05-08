<div class="school-competencies-list" data-test-school-competencies-list ...attributes>
  <div class="grid-row headers">
    <div class="grid-item">{{t "general.competency"}}</div>
    <div class="grid-item">{{t "general.aamcPcrs"}}</div>
  </div>
  {{#each this.proxies as |proxy|}}
    <SchoolCompetenciesListItem
      @competency={{proxy.domain}}
      @isDomain={{true}}
      @canUpdate={{@canUpdate}}
    />
    {{#each proxy.competencies as |competency|}}
      <SchoolCompetenciesListItem
        @competency={{competency}}
        @isDomain={{false}}
        @canUpdate={{@canUpdate}}
      />
    {{/each}}
  {{/each}}
</div>