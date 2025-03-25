<section class="courses-root" data-test-courses-root>
  <div class="filters">
    <div class="toggle-mycourses" data-test-my-courses-filter>
      <ToggleButtons
        @firstOptionSelected={{@userCoursesOnly}}
        @firstLabel={{t "general.myCourses"}}
        @secondLabel={{t "general.allCourses"}}
        @toggle={{@toggleUserCoursesOnly}}
      />
    </div>
    <div class="schoolsfilter" data-test-school-filter>
      <FaIcon @icon="building-columns" @fixedWidth={{true}} />
      {{#if this.hasMoreThanOneSchool}}
        <select
          aria-label={{t "general.filterBySchool"}}
          {{on "change" (pick "target.value" @changeSelectedSchool)}}
        >
          {{#each (sort-by "title" @schools) as |school|}}
            <option value={{school.id}} selected={{eq school this.selectedSchool}}>
              {{school.title}}
            </option>
          {{/each}}
        </select>
      {{else}}
        {{this.selectedSchool.title}}
      {{/if}}
    </div>
    <div class="yearsfilter">
      <FaIcon @icon="calendar" @fixedWidth={{true}} />
      <select
        aria-label={{t "general.filterByYear"}}
        {{on "change" (pick "target.value" @changeSelectedYear)}}
        data-test-year-filter
      >
        {{#each (sort-by "title:desc" @years) as |year|}}
          <option value={{year.id}} selected={{eq year this.selectedYear}}>
            {{year.title}}
          </option>
        {{/each}}
      </select>
    </div>
    <div class="titlefilter">
      <input
        value={{@titleFilter}}
        {{on "input" (pick "target.value" @changeTitleFilter)}}
        aria-label={{t "general.courseTitleFilterPlaceholder"}}
        placeholder={{t "general.courseTitleFilterPlaceholder"}}
        data-test-title-filter
      />
    </div>
  </div>
  <section class="courses">
    <div class="header">
      <h2 data-test-courses-header-title class="title">
        {{t "general.courses"}}
        ({{this.filteredCourses.length}})
      </h2>
      <div class="actions">
        {{#if this.canCreate}}
          <ExpandCollapseButton
            @value={{this.showNewCourseForm}}
            @action={{set this "showNewCourseForm" (not this.showNewCourseForm)}}
          />
        {{/if}}
      </div>
    </div>
    <section class="new">
      {{#if this.showNewCourseForm}}
        <Courses::New
          @currentSchool={{this.selectedSchool}}
          @currentYear={{this.selectedYear}}
          @save={{perform this.saveNewCourse}}
          @cancel={{set this "showNewCourseForm" false}}
        />
      {{/if}}
      {{#if this.newCourse}}
        <div class="saved-result" data-test-newly-saved-course>
          <LinkTo @route="course" @model={{this.newCourse}}>
            <FaIcon @icon="square-up-right" />
            {{this.newCourse.title}}
          </LinkTo>
          {{t "general.savedSuccessfully"}}
        </div>
      {{/if}}
    </section>
    <div class="list">
      {{#if this.coursesLoaded}}
        <Courses::List
          @courses={{this.filteredCourses}}
          @query={{@titleFilter}}
          @sortBy={{@sortCoursesBy}}
          @lock={{this.lockCourse}}
          @remove={{perform this.removeCourse}}
          @setSortBy={{@setSortCoursesBy}}
          @unlock={{this.unlockCourse}}
        />
      {{else}}
        <Courses::LoadingList />
      {{/if}}
    </div>
  </section>
</section>