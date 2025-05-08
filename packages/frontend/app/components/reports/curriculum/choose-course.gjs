<div class="reports-choose-course" data-test-reports-curriculum-choose-course>
  <div class="schools" data-test-schools>
    <FaIcon @icon="building-columns" />
    {{#if (gt this.filteredSchools.length 1)}}
      <select
        aria-label={{t "general.filterBySchool"}}
        {{on "change" (pick "target.value" (set this "selectedSchoolId"))}}
      >
        {{#each (sort-by "title" this.filteredSchools) as |school|}}
          <option value={{school.id}} selected={{eq school.id this.bestSelectedSchoolId}}>
            {{school.title}}
          </option>
        {{/each}}
      </select>
    {{else}}
      {{this.selectedSchool.title}}
    {{/if}}
    {{#if @selectedCourseIds.length}}
      <button
        type="button"
        aria-label={{t "general.deselectAllCourses"}}
        class="deselect-all"
        {{on "click" @removeAll}}
        data-test-deselect-all
      >
        {{t "general.deselectAllCourses"}}
      </button>
    {{/if}}
  </div>
  {{#each this.selectedSchoolYears as |y|}}
    <ul class="year {{if y.isExpanded 'expanded' 'collapsed'}}" data-test-year>
      <li>
        <input
          type="checkbox"
          checked={{y.hasAllSelectedCourses}}
          indeterminate={{y.hasSomeSelectedCourses}}
          {{on "click" (fn this.toggleAllCoursesInYear y)}}
          disabled={{eq y.courses.length 0}}
          aria-label={{t "general.selectedAllOrNone"}}
          data-test-toggle-all
        />
        <button
          type="button"
          aria-expanded={{if y.isExpanded "true" "false"}}
          {{on "click" (fn this.toggleYear y.year)}}
          data-test-expand
        >
          {{y.year}}
          <FaIcon @icon={{if y.isExpanded "caret-down" "caret-right"}} />
        </button>
        {{#if y.isExpanded}}
          <ul class="courses" data-test-courses>
            {{#each (sort-by "title" y.courses) as |c|}}
              <li data-test-course>
                <label>
                  <input
                    type="checkbox"
                    checked={{includes c.id @selectedCourseIds}}
                    {{on "click" (fn (if (includes c.id @selectedCourseIds) @remove @add) c.id)}}
                  />
                  {{c.title}}
                  {{#if c.externalId}}
                    ({{c.externalId}})
                  {{/if}}
                </label>
              </li>
            {{/each}}
          </ul>
        {{/if}}
      </li>
    </ul>
  {{/each}}
</div>