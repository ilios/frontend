import sortBy from 'ilios-common/helpers/sort-by';
import includes from 'ilios-common/helpers/includes';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import pcrsUriToNumber from 'frontend/helpers/pcrs-uri-to-number';
<template>
  <section
    class="school-competencies-pcrs-mapper"
    data-test-school-competencies-pcrs-mapper
    ...attributes
  >
    <ul>
      {{#each (sortBy "id" @allPcrses) as |pcrs|}}
        <li>
          {{#if (includes pcrs @selectedPcrses)}}
            <label {{on "click" (fn @remove pcrs)}} data-test-pcrs>
              <input type="checkbox" checked="checked" />
              <strong>{{pcrsUriToNumber pcrs.id}}</strong>
              {{pcrs.description}}
            </label>
          {{else}}
            <label {{on "click" (fn @add pcrs)}} data-test-pcrs>
              <input type="checkbox" />
              <strong>{{pcrsUriToNumber pcrs.id}}</strong>
              {{pcrs.description}}
            </label>
          {{/if}}
        </li>
      {{/each}}
    </ul>
  </section>
</template>
