import { LinkTo } from '@ember/routing';
import t from 'ember-intl/helpers/t';
import { pageTitle } from 'ember-page-title';
import VisualizeSessionTypeVocabularyGraph from './visualize-session-type-vocabulary-graph';
<template>
  {{pageTitle
    (t "general.schools")
    " | "
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
    <div class="backtolink" data-test-back-to-vocabularies>
      <LinkTo @route="session-type-visualize-vocabularies" @model={{@model.sessionType}}>
        {{t "general.backToVocabularies"}}
      </LinkTo>
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
