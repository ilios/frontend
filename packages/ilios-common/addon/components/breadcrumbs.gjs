import { LinkTo } from '@ember/routing';

<template>
  <div class="breadcrumbs" data-test-breadcrumbs>
    {{#each @routes as |route|}}
      <LinkTo @route={{route.path}} class="crumb">
        {{route.title}}
      </LinkTo>
    {{/each}}
    <span class="crumb">
      {{@rootTitle}}
    </span>
  </div>
</template>
