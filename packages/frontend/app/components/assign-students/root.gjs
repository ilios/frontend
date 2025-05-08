<section class="assign-students-root" data-test-assign-students-root>
  <div class="filters">
    <div class="schoolsfilter" data-test-school-filter>
      <FaIcon @icon="building-columns" @fixedWidth={{true}} />
      {{#if this.hasMoreThanOneSchool}}
        <select
          aria-label={{t "general.filterBySchool"}}
          {{on "change" (pick "target.value" this.changeSchool)}}
        >
          {{#each (sort-by "title" @model.schools) as |school|}}
            <option selected={{eq school this.selectedSchool}} value={{school.id}}>
              {{school.title}}
            </option>
          {{/each}}
        </select>
      {{else}}
        {{this.selectedSchool.title}}
      {{/if}}
    </div>
    <div class="titlefilter" data-test-title-filter>
      <input
        aria-label={{t "general.filterByTitle"}}
        placeholder={{t "general.pendingUserUpdates.filterBy"}}
        type="text"
        value={{@query}}
        {{on "input" (pick "target.value" (perform this.setQuery))}}
      />
    </div>
  </div>
  <AssignStudents::Manager
    @school={{this.selectedSchool}}
    @selectableStudents={{this.selectableAndSelectedStudents}}
    @selectedStudents={{this.selectedStudents}}
    @changeUserSelection={{this.changeUserSelection}}
    @changeAllUserSelections={{this.changeAllUserSelections}}
    @save={{perform this.save}}
    @isSaving={{this.save.isRunning}}
  />
</section>
{{#if this.save.isRunning}}
  <WaitSaving
    @currentProgress={{this.savedUserIds.length}}
    @showProgress={{true}}
    @totalProgress={{this.selectedUserIds.length}}
  />
{{/if}}