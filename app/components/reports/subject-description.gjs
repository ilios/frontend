<template>
  <div class="description" data-test-report-description>
    {{@description}}
    {{#if @resultsLength}}
      ({{@resultsLength}})
    {{/if}}
  </div>
</template>
