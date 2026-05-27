import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { service } from '@ember/service';
import { eq } from 'ember-truth-helpers';
import { TrackedAsyncData } from 'ember-async-data';
import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import { array, concat } from '@ember/helper';
import add from 'ember-math-helpers/helpers/add';
import Breadcrumbs from 'ilios-common/components/breadcrumbs';
import VisualizeTermGraph from 'ilios-common/components/course/visualize-term-graph';

export default class CourseVisualizeTermComponent extends Component {
  @service iliosConfig;
  @service intl;

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
    {
      route: 'course-visualize-vocabulary',
      title: this.args.model.term.title,
    },
  ];

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
    <section class="course-visualize-term data-visualization" data-test-course-visualize-term>
      {{#if this.academicYearCrossesCalendarYearBoundariesData.isResolved}}
        <Breadcrumbs
          @paths={{this.paths}}
          @model={{@model}}
          @rootTitle={{@model.term.title}}
          as |path index model|
        >
          {{#if (eq path.route "course-visualize-vocabulary")}}
            <LinkTo
              @route="course-visualize-vocabulary"
              @models={{array model.course.id model.term.vocabulary.id}}
              class="crumb"
              data-test-crumb
            >
              {{model.term.vocabulary.title}}
            </LinkTo>
          {{else}}
            <LinkTo @route={{path.route}} @model={{model.course}} class="crumb" data-test-crumb>
              {{path.title}}
            </LinkTo>
          {{/if}}
        </Breadcrumbs>
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
