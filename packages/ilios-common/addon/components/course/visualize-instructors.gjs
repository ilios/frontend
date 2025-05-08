import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';

export default class CourseVisualizeInstructorsComponent extends Component {
  @service iliosConfig;
  @tracked name;

  @cached
  get academicYearCrossesCalendarYearBoundariesData() {
    return new TrackedAsyncData(
      this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
    );
  }

  get academicYearCrossesCalendarYearBoundaries() {
    return this.academicYearCrossesCalendarYearBoundariesData.isResolved
      ? this.academicYearCrossesCalendarYearBoundariesData.value
      : false;
  }
}

<section class="course-visualize-instructors" data-test-course-visualize-instructors>
  {{#if this.academicYearCrossesCalendarYearBoundariesData.isResolved}}
    <div class="breadcrumbs" data-test-breadcrumb>
      <span>
        <LinkTo @route="course" @model={{@model}}>
          {{@model.title}}
        </LinkTo>
      </span>
      <span>
        <LinkTo @route="course-visualizations" @model={{@model}}>
          {{t "general.visualizations"}}
        </LinkTo>
      </span>
      <span>
        {{t "general.instructors"}}
      </span>
    </div>
    <h2>
      {{t "general.instructors"}}
    </h2>
    <h3 class="clickable" data-test-title>
      <LinkTo @route="course" @model={{@model}}>
        {{@model.title}}
        {{#if this.academicYearCrossesCalendarYearBoundaries}}
          {{@model.year}}
          -
          {{add @model.year 1}}
        {{else}}
          {{@model.year}}
        {{/if}}
      </LinkTo>
    </h3>
    {{#if @model.sessions.length}}
      <div class="filter" data-test-filter>
        <input
          aria-label={{t "general.filterChartPlaceholder"}}
          autocomplete="off"
          type="search"
          value={{this.name}}
          placeholder={{t "general.filterPlaceholder"}}
          {{on "input" (pick "target.value" (set this "name"))}}
        />
      </div>
    {{/if}}
    <div class="visualizations">
      <Course::VisualizeInstructorsGraph
        @filter={{this.name}}
        @course={{@model}}
        @showDataTable={{true}}
        @showNoChartDataError={{true}}
      />
    </div>
  {{/if}}
</section>