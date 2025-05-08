<div class="session-copy">
  {{#if this.allCoursesData.isResolved}}
    {{#let (unique-id) as |templateId|}}
      <div class="backtolink">
        <LinkTo @route="session" @model={{@session}}>
          {{t "general.backToTitle" title=@session.title}}
        </LinkTo>
      </div>
      <div class="copy-form" {{scroll-into-view}}>
        <h3 class="title">
          {{t "general.copySession"}}
        </h3>
        <p class="rollover-summary">
          {{t "general.copySessionSummary"}}
        </p>
        {{#if (and (is-array this.years) (is-array this.courses))}}
          <div class="item year-select">
            <label for="year-{{templateId}}">
              {{t "general.year"}}:
            </label>
            <select id="year-{{templateId}}" {{on "change" this.changeSelectedYear}}>
              {{#each this.years as |year|}}
                <option value={{year}} selected={{is-equal year this.bestSelectedYear}}>
                  {{year}}
                  -
                  {{add year 1}}
                </option>
              {{/each}}
            </select>
          </div>
          <div class="item course-select">
            <label for="course-{{templateId}}">
              {{t "general.targetCourse"}}:
            </label>
            {{#if (get this.courses "length")}}
              <select id="course-{{templateId}}" {{on "change" this.changeSelectedCourseId}}>
                {{#each (sort-by "title" this.courses) as |course|}}
                  <option
                    value={{course.id}}
                    selected={{is-equal course.id this.bestSelectedCourse.id}}
                  >
                    {{course.title}}
                  </option>
                {{/each}}
              </select>
            {{else}}
              {{t "general.none"}}
            {{/if}}
          </div>
          <div class="buttons">
            <button
              class="done text"
              type="button"
              disabled={{if
                (or this.save.isRunning (not this.bestSelectedYear) (not this.bestSelectedCourse))
                true
              }}
              {{on "click" (perform this.save)}}
              data-test-save
            >
              {{#if this.save.isRunning}}
                <LoadingSpinner />
              {{else}}
                {{t "general.done"}}
              {{/if}}
            </button>
            <LinkTo @route="session" @model={{@session}}>
              <button class="cancel text" type="button">
                {{t "general.cancel"}}
              </button>
            </LinkTo>
          </div>
        {{else}}
          <LoadingSpinner />
        {{/if}}
      </div>
    {{/let}}
  {{/if}}
</div>