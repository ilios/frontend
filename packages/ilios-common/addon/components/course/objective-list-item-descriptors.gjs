import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import FaIcon from 'ilios-common/components/fa-icon';
import sortBy from 'ilios-common/helpers/sort-by';
import { faArrowRotateLeft, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
<template>
  <div
    class="course-objective-list-item-descriptors grid-item"
    data-test-objective-list-item-descriptors
  >
    {{#if @isManaging}}
      <button
        type="button"
        class="bigadd"
        {{on "click" @save}}
        disabled={{@isSaving}}
        aria-label={{t "general.save"}}
        data-test-save
      >
        {{#if @isSaving}}
          <FaIcon @icon={{faSpinner}} @spin={{true}} />
        {{else}}
          <FaIcon @icon={{faCheck}} />
        {{/if}}
      </button>
      <button
        type="button"
        class="bigcancel"
        {{on "click" @cancel}}
        aria-label={{t "general.cancel"}}
        data-test-cancel
      >
        <FaIcon @icon={{faArrowRotateLeft}} />
      </button>
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
