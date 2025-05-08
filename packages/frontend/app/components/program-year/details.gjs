<div class="programyear-details" data-test-program-year-details ...attributes>
  {{#if @programYearLeadershipDetails}}
    <LeadershipExpanded
      @model={{@programYear}}
      @editable={{@canUpdate}}
      @collapse={{fn @setProgramYearLeadershipDetails false}}
      @expand={{fn @setProgramYearLeadershipDetails true}}
      @isManaging={{@manageProgramYearLeadership}}
      @setIsManaging={{@setManageProgramYearLeadership}}
    />
  {{else}}
    <LeadershipCollapsed
      @showAdministrators={{false}}
      @showDirectors={{true}}
      @directorsCount={{has-many-length @programYear "directors"}}
      @expand={{fn @setProgramYearLeadershipDetails true}}
    />
  {{/if}}
  {{#if (or (eq @programYear.competencies.length 0) @pyCompetencyDetails)}}
    <ProgramYear::Competencies
      @programYear={{@programYear}}
      @canUpdate={{@canUpdate}}
      @isManaging={{@managePyCompetencies}}
      @collapse={{fn @setPyCompetencyDetails false}}
      @expand={{fn @setPyCompetencyDetails true}}
      @setIsManaging={{@setManagePyCompetencies}}
    />
  {{else}}
    <CollapsedCompetencies @subject={{@programYear}} @expand={{fn @setPyCompetencyDetails true}} />
  {{/if}}
  {{#if (or (eq @programYear.programYearObjectives.length 0) @pyObjectiveDetails)}}
    <ProgramYear::Objectives
      @programYear={{@programYear}}
      @editable={{@canUpdate}}
      @collapse={{fn @setPyObjectiveDetails false}}
      @expand={{fn @setPyObjectiveDetails true}}
    />
  {{else}}
    <ProgramYear::CollapsedObjectives
      @programYear={{@programYear}}
      @expand={{fn @setPyObjectiveDetails true}}
    />
  {{/if}}
  {{#if (or (eq @programYear.terms.length 0) @pyTaxonomyDetails)}}
    <DetailTaxonomies
      @subject={{@programYear}}
      @editable={{@canUpdate}}
      @collapse={{fn @setPyTaxonomyDetails false}}
      @expand={{fn @setPyTaxonomyDetails true}}
    />
  {{else}}
    <CollapsedTaxonomies @subject={{@programYear}} @expand={{fn @setPyTaxonomyDetails true}} />
  {{/if}}
  <ProgramYear::Courses @programYear={{@programYear}} />
</div>