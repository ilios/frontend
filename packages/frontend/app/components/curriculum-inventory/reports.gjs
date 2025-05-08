<section class="curriculum-inventory-reports" data-test-curriculum-inventory-reports>
  <div class="filters">
    <div class="schoolsfilter" data-test-schools-filter>
      <FaIcon @icon="building-columns" @fixedWidth={{true}} />
      {{#if this.hasMoreThanOneSchool}}
        <select
          aria-label={{t "general.filterBySchool"}}
          {{on "change" (pick "target.value" this.changeSelectedSchool)}}
        >
          {{#each this.sortedSchools as |school|}}
            <option value={{school.id}} selected={{eq school this.selectedSchool}}>
              {{school.title}}
            </option>
          {{/each}}
        </select>
      {{else if this.selectedSchool}}
        {{this.selectedSchool.title}}
      {{else}}
        {{t "general.none"}}
      {{/if}}
    </div>
    <div class="programsfilter" data-test-programs-filter>
      <FaIcon @icon="rectangle-list" @fixedWidth={{true}} />
      {{#if this.programs.length}}
        <select
          aria-label={{t "general.filterByProgram"}}
          {{on "change" (pick "target.value" this.changeSelectedProgram)}}
        >
          {{#each this.programs as |program|}}
            <option value={{program.id}} selected={{eq program this.selectedProgram}}>
              {{program.title}}
            </option>
          {{/each}}
        </select>
      {{else if this.selectedProgram}}
        {{this.selectedProgram.title}}
      {{else}}
        {{t "general.none"}}
      {{/if}}
    </div>
  </div>
  <section class="reports">
    <div class="header">
      <h2 class="title">
        {{t "general.curriculumInventoryReports"}}
      </h2>
      {{#if (and this.canCreate this.selectedProgram)}}
        <div class="actions">
          <ExpandCollapseButton
            @value={{this.showNewCurriculumInventoryReportForm}}
            @action={{this.toggleNewCurriculumInventoryReportForm}}
          />
        </div>
      {{/if}}
    </div>
    <section class="new">
      {{#if this.showNewCurriculumInventoryReportForm}}
        <CurriculumInventory::NewReport
          @currentProgram={{this.selectedProgram}}
          @save={{this.saveNewCurriculumInventoryReport}}
          @cancel={{this.cancel}}
        />
      {{/if}}
      {{#if this.newReport}}
        <div class="saved-result" data-test-saved-results>
          <LinkTo @route="curriculum-inventory-report" @model={{this.newReport}}>
            <FaIcon @icon="square-up-right" />
            {{this.newReport.name}}
          </LinkTo>
          {{t "general.savedSuccessfully"}}
        </div>
      {{/if}}
    </section>
    <div class="list">
      <CurriculumInventory::ReportList
        @reports={{this.curriculumInventoryReports}}
        @sortBy={{@sortReportsBy}}
        @remove={{perform this.removeCurriculumInventoryReport}}
        @setSortBy={{@setSortBy}}
      />
    </div>
  </section>
</section>