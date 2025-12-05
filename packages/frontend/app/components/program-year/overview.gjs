import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faChartColumn } from '@fortawesome/free-solid-svg-icons';
<template>
  <div class="programyear-overview" data-test-program-year-overview ...attributes>
    <div class="programyear-overview-header">
      <h4 class="font-size-base" data-test-title>
        {{t "general.overview"}}
      </h4>
      <div class="programyear-overview-actions" data-test-actions>
        <LinkTo
          @route="program-year-visualize-objectives"
          @model={{@programYear}}
          title={{t "general.programYearVisualizations"}}
          class="font-size-medium"
          data-test-go-to-visualizations
        >
          <FaIcon @icon={{faChartColumn}} />
        </LinkTo>
      </div>
    </div>
  </div>
</template>
