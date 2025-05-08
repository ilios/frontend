import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import VisualizeObjectivesGraph from 'ilios-common/components/course/visualize-objectives-graph';
import VisualizeSessionTypesGraph from 'ilios-common/components/course/visualize-session-types-graph';
import VisualizeVocabulariesGraph from 'ilios-common/components/course/visualize-vocabularies-graph';
import VisualizeInstructorsGraph from 'ilios-common/components/course/visualize-instructors-graph';

export default class CourseVisualizationsComponent extends Component {
  @service iliosConfig;

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
  <template>
    <section class="course-visualizations" data-test-course-visualizations>
      {{#if this.academicYearCrossesCalendarYearBoundariesData.isResolved}}
        <div class="breadcrumbs" data-test-breadcrumb>
          <span>
            <LinkTo @route="course" @model={{@model}}>
              {{@model.title}}
            </LinkTo>
          </span>
          <span>
            {{t "general.visualizations"}}
          </span>
        </div>
        <h2>
          {{t "general.courseVisualizations"}}
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
        <div class="visualizations" data-test-visualizations>
          <div data-test-visualize-objectives>
            <LinkTo @route="course-visualize-objectives" @model={{@model}}>
              <h4>
                {{t "general.objectives"}}
              </h4>
              <VisualizeObjectivesGraph
                @isIcon={{true}}
                @course={{@model}}
                @showDataTable={{false}}
                @showNoChartDataError={{true}}
              />
            </LinkTo>
          </div>
          <div data-test-visualize-session-types>
            <LinkTo @route="course-visualize-session-types" @model={{@model}}>
              <h4>
                {{t "general.sessionTypes"}}
              </h4>
              <VisualizeSessionTypesGraph
                @isIcon={{true}}
                @course={{@model}}
                @showNoChartDataError={{true}}
              />
            </LinkTo>
          </div>
          <div data-test-visualize-vocabularies>
            <LinkTo @route="course-visualize-vocabularies" @model={{@model}}>
              <h4>
                {{t "general.vocabularies"}}
              </h4>
              <VisualizeVocabulariesGraph
                @isIcon={{true}}
                @course={{@model}}
                @showDataTable={{false}}
                @showNoChartDataError={{true}}
              />
            </LinkTo>
          </div>
          <div data-test-visualize-instructors>
            <LinkTo @route="course-visualize-instructors" @model={{@model}}>
              <h4>
                {{t "general.instructors"}}
              </h4>
              <VisualizeInstructorsGraph
                @isIcon={{true}}
                @course={{@model}}
                @showNoChartDataError={{true}}
              />
            </LinkTo>
          </div>
        </div>
      {{/if}}
    </section>
  </template>
}
