{{#let (load this.courseLoadingPromise) as |p|}}
  {{#if p.isResolved}}
    <Course::Details
      @course={{@course}}
      @editable={{@editable}}
      @showDetails={{@showDetails}}
      @setShowDetails={{@setShowDetails}}
      @courseLeadershipDetails={{@courseLeadershipDetails}}
      @courseObjectiveDetails={{@courseObjectiveDetails}}
      @courseTaxonomyDetails={{@courseTaxonomyDetails}}
      @courseCompetencyDetails={{@courseCompetencyDetails}}
      @courseManageLeadership={{@courseManageLeadership}}
      @setCourseLeadershipDetails={{@setCourseLeadershipDetails}}
      @setCourseObjectiveDetails={{@setCourseObjectiveDetails}}
      @setCourseTaxonomyDetails={{@setCourseTaxonomyDetails}}
      @setCourseCompetencyDetails={{@setCourseCompetencyDetails}}
      @setCourseManageLeadership={{@setCourseManageLeadership}}
    />
  {{else}}
    <Course::BackToCourses />

    <section
      aria-hidden="true"
      class="course-loader"
      {{animate-loading "course" finalOpacity=".75"}}
    >
      <Course::Header @course={{@course}} @editable={{false}} />
      <Course::Overview @course={{@course}} @editable={{false}} />

      <div class="mock-detail-box">
        <span>
          {{t "general.expandDetail"}}
          <FaIcon @icon="square-plus" class="expand-collapse-icon" />
        </span>
      </div>
    </section>
  {{/if}}
{{/let}}