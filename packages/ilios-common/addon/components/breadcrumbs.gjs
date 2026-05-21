import { LinkTo } from '@ember/routing';

<template>
  <div class="breadcrumbs" data-test-breadcrumbs>
    {{#each @paths as |path index|}}
      {{#if (has-block)}}
        {{yield path index @model}}
      {{else}}
        <LinkTo @route={{path.route}} @model={{@model}} @query={{path.query}} class="crumb">
          {{path.title}}
        </LinkTo>
      {{/if}}
    {{/each}}
    <span class="crumb">
      {{@rootTitle}}
    </span>
  </div>
</template>
