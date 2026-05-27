import Component from '@glimmer/component';
import { service } from '@ember/service';
import { LinkTo } from '@ember/routing';
import { array } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import Breadcrumbs from 'ilios-common/components/breadcrumbs';
import { pageTitle } from 'ember-page-title';
import VisualizerProgramYearObjectives from '../visualizer-program-year-objectives';

export default class CourseVisualizeProgramYearObjectivesComponent extends Component {
  @service intl;

  paths = [
    {
      route: 'program-year',
      title: this.args.model.program.get('title'),
    },
  ];

  <template>
    {{pageTitle
    (t "general.programs")
    " | "
    @model.program.title
    " "
    @model.cohort.title
    " | "
    (t "general.visualizations")
    " | "
    (t "general.objectives")
  }}

  <section
    class="program-year-visualize-objectives data-visualization"
    data-test-program-year-visualize-objectives
  >
    <Breadcrumbs
        @paths={{this.paths}}
        @model={{@model}}
        @rootTitle={{t "general.objectives"}}
        as |path index model|
      >
        <LinkTo
          @route={{path.route}}
          @models={{array model.program model}}
          class="crumb"
          data-test-crumb
        >
          {{model.program.title}}
          {{#if model.cohort.title}}
            {{model.cohort.title}}
          {{else}}
            {{t "general.classOf" year=model.classOfYear}}
          {{/if}}
        </LinkTo>
      </Breadcrumbs>
      <h2>
        {{t "general.objectives"}}
      </h2>
      <h3 data-test-title>
        <LinkTo @route="program-year" @models={{array @model.program @model}}>
          {{@model.program.title}}
          {{#if @model.cohort.title}}
            {{@model.cohort.title}}
          {{else}}
            {{t "general.classOf" year=@model.classOfYear}}
          {{/if}}
        </LinkTo>
      </h3>
      <div class="visualizations">
        <VisualizerProgramYearObjectives @programYear={{@model}} />
      </div>
    </section>
  </template>
}
