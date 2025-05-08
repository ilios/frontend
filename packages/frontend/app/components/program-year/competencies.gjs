<div class="program-year-competencies" ...attributes data-test-program-year-competencies>
  <div class="header" data-test-header>
    {{#if @isManaging}}
      <div class="title" data-test-title>
        <span class="specific-title">
          {{t "general.competenciesManageTitle"}}
        </span>
      </div>
    {{else}}
      {{#if this.programYearCompetencies}}
        <button
          class="title link-button"
          type="button"
          aria-expanded="true"
          data-test-title
          {{on "click" @collapse}}
        >
          {{t "general.competencies"}}
          ({{this.programYearCompetencies.length}})
          <FaIcon @icon="caret-down" />
        </button>
      {{else}}
        <div class="title" data-test-title>
          {{t "general.competencies"}}
          ({{this.programYearCompetencies.length}})
        </div>
      {{/if}}
    {{/if}}
    <div class="actions" data-test-actions>
      {{#if @canUpdate}}
        {{#if @isManaging}}
          <button type="button" class="bigadd" {{on "click" (perform this.save)}} data-test-save>
            <FaIcon
              @icon={{if this.save.isRunning "spinner" "check"}}
              @spin={{this.save.isRunning}}
            />
          </button>
          <button type="button" class="bigcancel" {{on "click" this.cancel}} data-test-cancel>
            <FaIcon @icon="arrow-rotate-left" />
          </button>
        {{else}}
          <button type="button" {{on "click" (fn @setIsManaging true)}} data-test-manage>
            {{t "general.competenciesManageTitle"}}
          </button>
        {{/if}}
      {{/if}}
    </div>
  </div>
  <div class="content">
    {{#if @isManaging}}
      <ul class="managed-competency-list" data-test-managed-list>
        {{#each (sort-by "title" this.domains) as |domain|}}
          <ProgramYear::ManagedCompetencyListItem
            @domain={{domain}}
            @selectedCompetencies={{this.selectedCompetencies}}
            @competenciesWithSelectedChildren={{this.competenciesWithSelectedChildren}}
            @competencies={{this.competencies}}
            @removeCompetencyFromBuffer={{this.removeCompetencyFromBuffer}}
            @addCompetencyToBuffer={{this.addCompetencyToBuffer}}
          />
        {{/each}}
      </ul>
    {{else if this.programYearCompetencies.length}}
      <ul class="competency-list" data-test-list>
        {{#each (sort-by "title" this.domains) as |domain|}}
          {{#if
            (or
              (includes domain.id (map-by "id" this.selectedCompetencies))
              (includes domain this.competenciesWithSelectedChildren)
            )
          }}
            <ProgramYear::CompetencyListItem
              @domain={{domain}}
              @selectedCompetencies={{this.selectedCompetencies}}
              @competencies={{this.competencies}}
            />
          {{/if}}
        {{/each}}
      </ul>
    {{/if}}
  </div>
</div>