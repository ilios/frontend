import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import { pageTitle } from 'ember-page-title';
import VisualizeObjectivesGraph from 'ilios-common/components/course/visualize-objectives-graph';

export default class CourseVisualizeObjectivesComponent extends Component {
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
      (t "general.objectives")
    }}

    <section
      class="course-visualize-objectives data-visualization"
      data-test-course-visualize-objectives
    >
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
          {{t "general.objectives"}}
        </span>
      </div>
      <h2>
        {{t "general.objectives"}}
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
      <div class="visualizations">
        <VisualizeObjectivesGraph
          @course={{@model}}
          @showDataTable={{true}}
          @showNoChartDataError={{true}}
        />
      </div>
    </section>
  </template>
}
