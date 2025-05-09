import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import VisualizeSessionTypeVocabulariesGraph from 'frontend/components/school/visualize-session-type-vocabularies-graph';
<template>
  <section
    class="school-session-type-visualize-vocabularies"
    data-test-school-session-type-visualize-vocabularies
    ...attributes
  >
    <div class="breadcrumbs" data-test-breadcrumb>
      <span>
        <LinkTo
          @route="school"
          @model={{@model.school}}
          @query={{hash schoolSessionTypeDetails=true}}
        >
          {{@model.school.title}}
        </LinkTo>
      </span>
      <span>
        {{t "general.visualizations"}}
      </span>
      <span>
        {{t "general.sessionTypes"}}
      </span>
      <span>
        {{@model.title}}
      </span>
      <span>
        {{t "general.vocabularies"}}
      </span>
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
