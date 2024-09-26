<div class="new-subject-search" data-test-reports-subject-new-course>
  <p data-test-search>
    <label for="{{this.uniqueId}}-course-search">
      {{t "general.whichIs"}}
    </label>
    {{#if @currentId}}
      {{#let (load this.loadCourse) as |p|}}
        {{#if p.isResolved}}
          {{#let p.value as |course|}}
            <button
              class="link-button"
              type="button"
              {{on "click" this.clear}}
              data-test-selected-course
            >
              {{course.year}}&nbsp;
              {{#if course.externalId}}
                [{{course.externalId}}]&nbsp;
              {{/if}}
              {{course.title}}
              <FaIcon @icon="xmark" class="remove" />
            </button>
          {{/let}}
        {{else}}
          <LoadingSpinner />
        {{/if}}
      {{/let}}
    {{else}}
      <Reports::Subject::New::Search::Input
        @search={{perform this.search}}
        @searchIsRunning={{this.search.isRunning}}
        @searchIsIdle={{this.search.isIdle}}
        @searchReturned={{is-array this.courses}}
        @results={{this.sortedCourses}}
        as |course|
      >
        <button class="link-button" type="button" {{on "click" (fn @changeId course.id)}}>
          {{course.year}}&nbsp;
          {{#if course.externalId}}
            [{{course.externalId}}]&nbsp;
          {{/if}}
          {{course.title}}
        </button>

      </Reports::Subject::New::Search::Input>
    {{/if}}
  </p>
</div>