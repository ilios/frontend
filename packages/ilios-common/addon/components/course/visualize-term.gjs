import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import { array, concat } from '@ember/helper';
import add from 'ember-math-helpers/helpers/add';
import VisualizeTermGraph from 'ilios-common/components/course/visualize-term-graph';

export default class CourseVisualizeTermComponent extends Component {
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
    <section class="course-visualize-term" data-test-course-visualize-term>
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
            <LinkTo @route="course-visualize-vocabularies" @model={{@model.course}}>
              {{t "general.vocabularies"}}
            </LinkTo>
          </span>
          <span>
            <LinkTo
              @route="course-visualize-vocabulary"
              @models={{array @model.course.id @model.term.vocabulary.id}}
            >
              {{@model.term.vocabulary.title}}
            </LinkTo>
          </span>
          <span>
            {{@model.term.title}}
          </span>
        </div>
        <h2>
          {{t
            "general.sessionTypesFor"
            subject=(concat @model.term.vocabulary.title " - " @model.term.title)
          }}
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
          <VisualizeTermGraph
            @course={{@model.course}}
            @term={{@model.term}}
            @showDataTable={{true}}
          />
        </div>
      {{/if}}
    </section>
  </template>
}
