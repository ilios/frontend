import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faChartColumn } from '@fortawesome/free-solid-svg-icons';
<template>
  <div class="ilios-overview programyear-overview" data-test-program-year-overview ...attributes>
    <div class="overview-header">
      <h4 class="overview-title" data-test-title>
        {{t "general.overview"}}
      </h4>
      <div class="overview-actions" data-test-actions>
        <LinkTo
          @route="program-year-visualize-objectives"
          @model={{@programYear}}
          title={{t "general.programYearVisualizations"}}
          data-test-go-to-visualizations
        >
          <FaIcon @icon={{faChartColumn}} />
        </LinkTo>
      </div>
    </div>
  </div>
</template>
