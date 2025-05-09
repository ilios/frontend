import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import VisualizeSessionTypeGraph from 'ilios-common/components/course/visualize-session-type-graph';

export default class CourseVisualizeSessionTypeComponent extends Component {
  @service iliosConfig;
  @tracked title;

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
    <section class="course-visualize-session-type" data-test-course-visualize-session-type>
      {{#if this.academicYearCrossesCalendarYearBoundariesData.isResolved}}
        <div class="breadcrumbs" data-test-breadcrumb>
          <span>
            <LinkTo @route="course" @model={{@model.course}}>
              {{@model.course.title}}
            </LinkTo>
          </span>
          <span>
            <LinkTo @route="course-visualizations" @model={{@model.course}}>
              {{t "general.visualizations"}}
            </LinkTo>
          </span>
          <span>
            <LinkTo @route="course-visualize-session-types" @model={{@model.course}}>
              {{t "general.sessionTypes"}}
            </LinkTo>
          </span>
          <span>
            {{@model.sessionType.title}}
          </span>
        </div>
        <h2>
          {{t "general.vocabularyTermsFor" subject=@model.sessionType.title}}
        </h2>
        <h3 class="clickable" data-test-title>
          <LinkTo @route="course" @model={{@model.course}}>
            {{@model.course.title}}
            {{#if this.academicYearCrossesCalendarYearBoundaries}}
              {{@model.course.year}}
              -
              {{add @model.course.year 1}}
            {{else}}
              {{@model.course.year}}
            {{/if}}
          </LinkTo>
        </h3>
        <div class="visualizations">
          <VisualizeSessionTypeGraph
            @course={{@model.course}}
            @sessionType={{@model.sessionType}}
            @showDataTable={{true}}
          />
        </div>
      {{/if}}
    </section>
  </template>
}
