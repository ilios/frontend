import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import { hash } from '@ember/helper';
import { pageTitle } from 'ember-page-title';
import VisualizeSessionTypeVocabulariesGraph from './visualize-session-type-vocabularies-graph';
<template>
  {{pageTitle
    (t "general.schools")
    " | "
    @model.school.title
    " | "
    (t "general.visualizations")
    " | "
    (t "general.sessionTypes")
    " | "
    @model.title
    " | "
    (t "general.vocabularies")
  }}
  <section
    class="school-session-type-visualize-vocabularies data-visualization"
    data-test-school-session-type-visualize-vocabularies
    ...attributes
  >
    <div class="backtolink" data-test-back-to-school>
      <LinkTo
        @route="school"
        @model={{@model.school}}
        @query={{hash schoolSessionTypeDetails=true}}
      >
        {{t "general.backToSchool"}}
      </LinkTo>
    </div>
    <h2 data-test-primary-title>{{t "general.vocabulariesBySessionType"}}</h2>
    <h3 data-test-secondary-title>
      {{@model.title}}
    </h3>
    <div class="visualizations">
      <VisualizeSessionTypeVocabulariesGraph @sessionType={{@model}} @showDataTable={{true}} />
    </div>
  </section>
</template>
