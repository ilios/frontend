import FaIcon from 'ilios-common/components/fa-icon';
import t from 'ember-intl/helpers/t';
import { LinkTo } from '@ember/routing';
import SingleEventLearningmaterialListItem from 'ilios-common/components/single-event-learningmaterial-list-item';
import and from 'ember-truth-helpers/helpers/and';
import not from 'ember-truth-helpers/helpers/not';
<template>
  <div
    class="single-event-learningmaterial-list"
    data-test-single-event-learningmaterial-list
    ...attributes
  >
    {{#if @prework.length}}
      <ul class="static-list prework">
        {{#each @prework as |event|}}
          <li data-test-prework-event>
            <FaIcon @title={{t "general.preWork"}} @icon="person-chalkboard" />
            {{#unless event.isPublished}}
              <FaIcon @title={{t "general.notPublished"}} @icon="file-signature" />
            {{/unless}}
            <LinkTo @route="events" @model={{event.slug}} data-test-name>
              {{event.name}}
            </LinkTo>
            {{#each event.learningMaterials as |lm|}}
              <SingleEventLearningmaterialListItem @learningMaterial={{lm}} />
            {{/each}}
          </li>
        {{/each}}
      </ul>
    {{/if}}
    {{#if @learningMaterials.length}}
      <ul class="static-list">
        {{#each @learningMaterials as |lm|}}
          <SingleEventLearningmaterialListItem @learningMaterial={{lm}} @linked={{true}} />
        {{/each}}
      </ul>
    {{/if}}
    {{#if (and (not @learningMaterials.length) (not @prework.length))}}
      <p class="no-content" data-test-no-content>
        {{t "general.none"}}
      </p>
    {{/if}}
  </div>
</template>
