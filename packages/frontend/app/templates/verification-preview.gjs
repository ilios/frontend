import pageTitle from 'ember-page-title/helpers/page-title';
import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
import VerificationPreviewHeader from 'frontend/components/curriculum-inventory/verification-preview-header';
import VerificationPreview from 'frontend/components/curriculum-inventory/verification-preview';
<template>
  {{pageTitle (t "general.curriculumInventoryReports")}}
  <div data-test-back-to-report class="backtolink">
    <LinkTo @route="curriculum-inventory-report" @model={{@model}}>
      {{t "general.backToReport"}}
    </LinkTo>
  </div>
  <VerificationPreviewHeader @report={{@model}} />
  <VerificationPreview @report={{@model}} />
</template>
