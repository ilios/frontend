<div
  id="competency-{{@competency.id}}"
  class="competency-row grid-row {{if this.isManaging 'is-managing'}}"
  data-test-school-competencies-list-item
  ...attributes
>
  <div class="grid-item {{if this.isDomain 'domain' 'competency'}}" data-test-title>
    {{@competency.title}}
  </div>
  <SchoolCompetenciesListItemPcrs
    @competency={{@competency}}
    @canUpdate={{@canUpdate}}
    @setIsManaging={{this.setIsManaging}}
    @isManaging={{this.isManaging}}
    @save={{this.save}}
    @cancel={{this.cancel}}
  />
  {{#if this.isManaging}}
    <SchoolCompetenciesPcrsMapper
      @allPcrses={{this.allPcrses}}
      @selectedPcrses={{this.selectedPcrses}}
      @add={{this.addPcrsToBuffer}}
      @remove={{this.removePcrsFromBuffer}}
    />
  {{/if}}
</div>