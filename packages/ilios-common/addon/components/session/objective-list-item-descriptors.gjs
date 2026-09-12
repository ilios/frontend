import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import sortBy from 'ilios-common/helpers/sort-by';
import BigAddCancelButtons from 'ilios-common/components/big-add-cancel-buttons';
<template>
  <div
    class="session-objective-list-item-descriptors grid-item"
    data-test-objective-list-item-descriptors
  >
    {{#if @isManaging}}
      <BigAddCancelButtons @add={{@save}} @cancel={{@cancel}} @disableSave={{@isSaving}} />
    {{else}}
      <ul class="mesh-descriptor-list">
        {{#each (sortBy "name" @meshDescriptors) as |descriptor|}}
          {{#if @editable}}
            <li data-test-term>
              <button type="button" class="link-button" {{on "click" @manage}} data-test-manage>
                {{descriptor.name}}
              </button>
            </li>
          {{else}}
            <li data-test-term>
              {{descriptor.name}}
            </li>
          {{/if}}
        {{else}}
          <li>
            {{#if @editable}}
              <button type="button" {{on "click" @manage}} data-test-manage>
                {{t "general.addNew"}}
              </button>
            {{else}}
              {{t "general.none"}}
            {{/if}}
          </li>
        {{/each}}
      </ul>
    {{/if}}
  </div>
</template>
