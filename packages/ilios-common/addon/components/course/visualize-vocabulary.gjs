import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import VisualizeVocabularyGraph from 'ilios-common/components/course/visualize-vocabulary-graph';

export default class CourseVisualizeVocabularyComponent extends Component {
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
      class="course-visualize-vocabulary"
      data-test-course-visualize-vocabulary
      ...attributes
    >
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
          {{@model.vocabulary.title}}
        </span>
      </div>
      <h2 data-test-vocabulary-title>
        {{@model.vocabulary.title}}
      </h2>
      <h3 class="clickable" data-test-course-title>
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
        <VisualizeVocabularyGraph
          @course={{@model.course}}
          @vocabulary={{@model.vocabulary}}
          @showDataTable={{true}}
        />
      </div>
    </section>
  </template>
}
