import { LinkTo } from '@ember/routing';

<template>
  <div class="breadcrumbs" data-test-breadcrumbs>
    {{#if @paths.length}}
      {{#each @paths as |path index|}}
        {{#if (has-block)}}
          {{yield path index @model}}
        {{else if path.query}}
          <LinkTo
            @route={{path.route}}
            @model={{@model}}
            @query={{path.query}}
            class="crumb"
            data-test-crumb
          >
            {{path.title}}
          </LinkTo>
        {{else}}
          <LinkTo @route={{path.route}} @model={{@model}} class="crumb" data-test-crumb>
            {{path.title}}
          </LinkTo>
        {{/if}}
      {{/each}}
      <span class="crumb" data-test-crumb>
        {{@rootTitle}}
      </span>
    {{else}}
      {{#if (has-block)}}
        {{yield}}
        <span class="crumb" data-test-crumb>
          {{@rootTitle}}
        </span>
      {{/if}}
    {{/if}}
  </div>
</template>
