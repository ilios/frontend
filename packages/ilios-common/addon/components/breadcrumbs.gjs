import { LinkTo } from '@ember/routing';

<template>
  <div class="breadcrumbs" data-test-breadcrumbs>
    {{#each @paths as |path|}}
      {{#if (has-block)}}
        {{yield path @model}}
      {{else}}
        <LinkTo @route={{path.route}} @model={{@model}} class="crumb">
          {{path.title}}
        </LinkTo>
      {{/if}}
    {{/each}}
    <span class="crumb">
      {{@rootTitle}}
    </span>
  </div>
</template>
