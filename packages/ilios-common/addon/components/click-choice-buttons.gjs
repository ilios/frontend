import { on } from '@ember/modifier';
import noop from 'ilios-common/helpers/noop';
import { fn } from '@ember/helper';
<template>
  <div class="click-choice-buttons" data-test-click-choice-buttons>
    <button
      class="first-button {{if @firstChoicePicked 'active'}}"
      type="button"
      data-test-first-button
      {{on "click" (if @firstChoicePicked (noop) (fn @toggle true))}}
    >
      {{@buttonContent1}}
    </button>
    <button
      class="second-button {{unless @firstChoicePicked 'active'}}"
      type="button"
      data-test-second-button
      {{on "click" (if @firstChoicePicked (fn @toggle false) (noop))}}
    >
      {{@buttonContent2}}
    </button>
  </div>
</template>
