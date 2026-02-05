import eq from 'ember-truth-helpers/helpers/eq';
import t from 'ember-intl/helpers/t';
import { concat } from '@ember/helper';
<template>
  {{#if @tags}}
    <div class="global-search-tags" data-test-global-search-tags>
      {{#each @tags as |tag|}}
        <span class="global-search-tag font-size-smallest" data-test-global-search-tag>
          {{#if (eq tag "meshdescriptors")}}
            {{t "general.mesh"}}
          {{else if (eq tag "learningmaterials")}}
            {{t "general.learningMaterials"}}
          {{else}}
            {{t (concat "general." tag)}}
          {{/if}}
        </span>
      {{/each}}
    </div>
  {{/if}}
</template>
