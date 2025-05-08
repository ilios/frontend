<section class="course-visualize-instructor" data-test-course-visualize-instructor>
  <div class="breadcrumbs" data-test-breadcrumb>
    <span>
      <LinkTo @route="course" @model={{@course}}>
        {{@course.title}}
      </LinkTo>
    </span>
    <span>
      <LinkTo @route="course-visualizations" @model={{@course}}>
        {{t "general.visualizations"}}
      </LinkTo>
    </span>
    <span>
      <LinkTo @route="course-visualize-instructors" @model={{@course}}>
        {{t "general.instructors"}}
      </LinkTo>
    </span>
    <span>
      {{@user.fullName}}
    </span>
  </div>
  <h2 data-test-instructor-name>
    {{@user.fullName}}
  </h2>
  <h3 data-test-total-offerings-time>
    {{t "general.totalInstructionalTime" minutes=this.totalInstructionalTime}}
  </h3>
  <h3 data-test-total-ilm-time>
    {{t "general.totalIlmTime" minutes=this.totalIlmTime}}
  </h3>
  <h3 class="clickable" data-test-title>
    <LinkTo @route="course" @model={{@course}}>
      {{@course.title}}
      {{#if this.academicYearCrossesCalendarYearBoundaries}}
        {{@course.year}}
        -
        {{add @course.year 1}}
      {{else}}
        {{@course.year}}
      {{/if}}
    </LinkTo>
  </h3>
  <div class="visualizations">
    <div>
      <h4>
        {{t "general.terms"}}
      </h4>
      <Course::VisualizeInstructorTermGraph
        @course={{@course}}
        @user={{@user}}
        @showDataTable={{true}}
      />
    </div>
    <div>
      <h4>
        {{t "general.sessionTypes"}}
      </h4>
      <Course::VisualizeInstructorSessionTypeGraph
        @course={{@course}}
        @user={{@user}}
        @showDataTable={{true}}
      />
    </div>
  </div>
</section>