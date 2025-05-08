import repeat from 'ilios-common/helpers/repeat';
import truncate from 'ilios-common/helpers/truncate';
import random from 'ember-math-helpers/helpers/random';
<template>
  {{! template-lint-disable no-unused-block-params }}
  {{#each (repeat @count) as |empty|}}
    <div class="grid-row is-loading">
      <span class="grid-item">{{truncate (repeat (random 3 10) "ilios rocks") 100}}</span>
      <span class="grid-item">{{repeat (random 1 3) "loading "}}</span>
      <span class="grid-item">{{repeat (random 1 3) "loading "}}</span>
      <span class="grid-item">{{repeat (random 1 3) "loading "}}</span>
      <span class="grid-item"></span>
    </div>
  {{/each}}
</template>
