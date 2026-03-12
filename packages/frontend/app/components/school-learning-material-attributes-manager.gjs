import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
<template>
  {{#let (uniqueId) as |templateId|}}
    <div data-test-school-learning-material-attributes-manager ...attributes>
      <table class="ilios-table ilios-table-colors condensed">
        <thead>
          <tr>
            <th class="text-left">
              {{t "general.attribute"}}
            </th>
            <th class="text-left">
              {{t "general.enabled"}}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr data-test-accessibility-required>
            <td id="accessibility-required-{{templateId}}">
              {{t "general.accessibilityRequired"}}
            </td>
            <td>
              {{#if @showLearningMaterialAccessibilityRequired}}
                <input
                  type="checkbox"
                  checked={{true}}
                  {{on "click" (fn @disable "showLearningMaterialAccessibilityRequired")}}
                  aria-labelledby="accessibility-required-{{templateId}}"
                />
              {{else}}
                <input
                  type="checkbox"
                  {{on "click" (fn @enable "showLearningMaterialAccessibilityRequired")}}
                  aria-labelledby="accessibility-required-{{templateId}}"
                />
              {{/if}}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  {{/let}}
</template>
