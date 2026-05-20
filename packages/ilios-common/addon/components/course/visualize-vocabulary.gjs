import Component from '@glimmer/component';
import { service } from '@ember/service';
import { TrackedAsyncData } from 'ember-async-data';
import { cached } from '@glimmer/tracking';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import add from 'ember-math-helpers/helpers/add';
import { pageTitle } from 'ember-page-title';
import Breadcrumbs from 'ilios-common/components/breadcrumbs';
import VisualizeVocabularyGraph from 'ilios-common/components/course/visualize-vocabulary-graph';

export default class CourseVisualizeVocabularyComponent extends Component {
  @service iliosConfig;
  @service intl;

  crossesBoundaryConfig = new TrackedAsyncData(
    this.iliosConfig.itemFromConfig('academicYearCrossesCalendarYearBoundaries'),
  );

  paths = [
    {
      route: 'course',
      title: this.args.model.course.title,
    },
    {
      route: 'course-visualizations',
      title: this.intl.t('general.visualizations'),
    },
    {
      route: 'course-visualize-vocabularies',
      title: this.intl.t('general.vocabularies'),
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
      @model.course.title
      " | "
      (t "general.visualizations")
      " | "
      (t "general.vocabulary")
      " | "
      @model.vocabulary.title
    }}

    <section
      class="course-visualize-vocabulary data-visualization"
      data-test-course-visualize-vocabulary
      ...attributes
    >
      <Breadcrumbs
        @paths={{this.paths}}
        @model={{@model.course}}
        @rootTitle={{@model.vocabulary.title}}
      />
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
