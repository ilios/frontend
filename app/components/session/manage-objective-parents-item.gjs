import { on } from '@ember/modifier';
import htmlSafe from 'ilios-common/helpers/html-safe';
import removeHtmlTags from 'ilios-common/helpers/remove-html-tags';
<template>
  {{#if @isSelected}}
    <label {{on "click" @remove}} class="selected">
      <input type="checkbox" checked="checked" />
      {{htmlSafe (removeHtmlTags @title)}}
    </label>
  {{else}}
    <label {{on "click" @add}}>
      <input type="checkbox" />
      {{htmlSafe (removeHtmlTags @title)}}
    </label>
  {{/if}}
</template>
