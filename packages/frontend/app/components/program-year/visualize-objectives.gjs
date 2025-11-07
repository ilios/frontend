import { LinkTo } from '@ember/routing';
import { array } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import VisualizerProgramYearObjectives from 'frontend/components/visualizer-program-year-objectives';
<template>
  <section
    class="program-year-visualize-objectives data-visualization"
    data-test-program-year-visualize-objectives
  >
    <div class="breadcrumbs" data-test-breadcrumb>
      <span>
        <LinkTo @route="program-year" @models={{array @model.program @model}}>
          {{@model.program.title}}
          {{#if @model.cohort.title}}
            {{@model.cohort.title}}
          {{else}}
            {{t "general.classOf" year=@model.classOfYear}}
          {{/if}}
        </LinkTo>
      </span>
      <span>
        {{t "general.objectives"}}
      </span>
    </div>
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
