import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import { pageTitle } from 'ember-page-title';
import VisualizeSessionTypesGraph from 'ilios-common/components/course/visualize-session-types-graph';

export default class CourseVisualizeSessionTypesComponent extends Component {
  @service iliosConfig;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : null;
  }
  <template>
    {{pageTitle
      (t "general.courses")
      " | "
      @model.title
      " | "
      (t "general.visualizations")
      " | "
      (t "general.sessionTypes")
    }}

    <section class="course-visualize-session-types" data-test-course-visualize-session-types>
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
          {{t "general.sessionTypes"}}
        </span>
      </div>
      <h2>
        {{t "general.sessionTypes"}}
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
            value={{this.title}}
            placeholder={{t "general.filterPlaceholder"}}
            {{on "input" (pick "target.value" (set this "title"))}}
          />
        </div>
      {{/if}}
      <div class="visualizations">
        <VisualizeSessionTypesGraph
          @filter={{this.title}}
          @course={{@model}}
          @showDataTable={{true}}
          @showNoChartDataError={{true}}
        />
      </div>
    </section>
  </template>
}
