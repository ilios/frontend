import t from 'ember-intl/helpers/t';
<template>
  <span class={{if @value "yes" "no"}} data-test-yes-no ...attributes>
    {{#if @value}}
      {{t "general.yes"}}
    {{else}}
      {{t "general.no"}}
    {{/if}}
  </span>
</template>
