import { on } from '@ember/modifier';
<template>
  <label
    data-test-filter-checkbox
    data-test-target
    data-test-checked={{@checked}}
    data-test-filter-checkbox-target-id={{@targetId}}
  >
    <input type="checkbox" checked={{@checked}} {{on "click" (if @checked @remove @add)}} />
    {{yield}}
  </label>
</template>
