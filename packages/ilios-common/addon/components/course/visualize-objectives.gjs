import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import { pageTitle } from 'ember-page-title';
import Breadcrumbs from 'ilios-common/components/breadcrumbs';
import VisualizeObjectivesGraph from 'ilios-common/components/course/visualize-objectives-graph';

export default class CourseVisualizeObjectivesComponent extends Component {
  @service iliosConfig;
  @service intl;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  paths = [
    {
      route: 'course',
      title: this.args.model.title,
      query: {},
    },
    {
      route: 'course-visualizations',
      title: this.intl.t('general.visualizations'),
      query: {},
    },
  ];

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
      <Breadcrumbs @paths={{this.paths}} @model={{@model}} @rootTitle={{t "general.objectives"}} />
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
