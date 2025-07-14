import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
import FaIcon from 'ilios-common/components/fa-icon';
<template>
  <div class="programyear-overview" data-test-program-year-overview ...attributes>
    <div class="programyear-overview-header">
      <h4 data-test-title>
        {{t "general.overview"}}
      </h4>
      <div class="programyear-overview-actions" data-test-actions>
        <LinkTo
          @route="program-year-visualize-objectives"
          @model={{@programYear}}
          title={{t "general.programYearVisualizations"}}
          data-test-go-to-visualizations
        >
          <FaIcon @icon="chart-column" />
        </LinkTo>
      </div>
    </div>
  </div>
</template>
