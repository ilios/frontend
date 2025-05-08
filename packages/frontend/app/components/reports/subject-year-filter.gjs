<div class="years-filter" data-test-report-subject-year-filter>
  <label>{{t "general.academicYear"}}
    <select data-test-year-filter {{on "change" (pick "target.value" @changeYear)}}>
      <option selected={{is-empty @selectedYear}} value="">
        {{t "general.allAcademicYears"}}
      </option>
      {{#each (sort-by "title:desc" this.allAcademicYears) as |year|}}
        <option value={{year.id}} selected={{eq year.id @selectedYear}}>
          {{year.title}}
        </option>
      {{/each}}
    </select>
  </label>
</div>