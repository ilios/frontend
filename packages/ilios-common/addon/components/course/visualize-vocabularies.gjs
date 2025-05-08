import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import VisualizeVocabulariesGraph from 'ilios-common/components/course/visualize-vocabularies-graph';

export default class CourseVisualizeVocabulariesComponent extends Component {
  @service iliosConfig;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  @cached
  get academicYearCrossesCalendarYearBoundaries() {
    return this.crossesBoundaryConfig.isResolved ? this.crossesBoundaryConfig.value : null;
  }
  <template>
    <section
      class="course-visualize-vocabularies"
      data-test-course-visualize-vocabularies
      ...attributes
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
          {{t "general.vocabularies"}}
        </span>
      </div>
      <h2>
        {{t "general.vocabularies"}}
      </h2>
      <h3 class="clickable" data-test-course-title>
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
        <VisualizeVocabulariesGraph
          @course={{@model}}
          @showDataTable={{true}}
          @showNoChartDataError={{true}}
        />
      </div>
    </section>
  </template>
}
