import { LinkTo } from '@ember/routing';
import { hash } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { pageTitle } from 'ember-page-title';
import VisualizeSessionTypeVocabularyGraph from 'frontend/components/school/visualize-session-type-vocabulary-graph';
<template>
  {{pageTitle
    "Schools | "
    @model.vocabulary.school.title
    " | "
    (t "general.visualizations")
    " | "
    (t "general.sessionTypes")
    " | "
    @model.sessionType.title
    " | "
    (t "general.vocabularies")
    " | "
    @model.vocabulary.title
  }}
  <section
    class="school-session-type-visualize-vocabulary data-visualization"
    data-test-school-session-type-visualize-vocabulary
    ...attributes
  >
    <div class="breadcrumbs" data-test-breadcrumb>
      <span>
        <LinkTo
          @route="school"
          @model={{@model.vocabulary.school}}
          @query={{hash schoolSessionTypeDetails=true}}
        >
          {{@model.vocabulary.school.title}}
        </LinkTo>
      </span>
      <span>
        {{t "general.visualizations"}}
      </span>
      <span>
        {{t "general.sessionTypes"}}
      </span>
      <span>
        {{@model.sessionType.title}}
      </span>
      <span>
        <LinkTo @route="session-type-visualize-vocabularies" @model={{@model.sessionType}}>
          {{t "general.vocabularies"}}
        </LinkTo>
      </span>
      <span>
        {{@model.vocabulary.title}}
      </span>
    </div>
    <h2 data-test-primary-title>{{t "general.termsBySessionType"}}</h2>
    <h3 data-test-secondary-title>
      {{@model.sessionType.title}}
      ({{@model.vocabulary.title}})
    </h3>
    <div class="visualizations">
      <VisualizeSessionTypeVocabularyGraph
        @sessionType={{@model.sessionType}}
        @vocabulary={{@model.vocabulary}}
        @showDataTable={{true}}
      />
    </div>
  </section>
</template>
