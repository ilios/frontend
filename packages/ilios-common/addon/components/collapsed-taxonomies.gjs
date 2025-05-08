import { on } from '@ember/modifier';
import t from 'ember-intl/helpers/t';
import FaIcon from 'ilios-common/components/fa-icon';
import { get } from '@ember/helper';
import intersect from 'ilios-common/helpers/intersect';
import hasManyIds from 'ilios-common/helpers/has-many-ids';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
<template>
  <section class="collapsed-taxonomies" data-test-collapsed-taxonomies>
    <div>
      <button
        class="title link-button"
        type="button"
        aria-expanded="false"
        data-test-title
        {{on "click" @expand}}
      >
        {{t "general.terms"}}
        ({{@subject.terms.length}})
        <FaIcon @icon="caret-right" />
      </button>
    </div>
    {{#if @subject.associatedVocabularies}}
      <div class="content">
        <table class="condensed">
          <thead>
            <tr>
              <th class="text-left">
                {{t "general.vocabulary"}}
              </th>
              <th class="text-center">
                {{t "general.school"}}
              </th>
              <th class="text-center">
                {{t "general.assignedTerms"}}
              </th>
            </tr>
          </thead>
          <tbody>
            {{#each @subject.associatedVocabularies as |vocab|}}
              <tr>
                <td class="text-left">
                  {{vocab.title}}
                </td>
                <td class="text-center">
                  {{vocab.school.title}}
                </td>
                <td class="text-center">
                  {{get
                    (intersect (hasManyIds @subject "terms") (hasManyIds vocab "terms"))
                    "length"
                  }}
                </td>
              </tr>
            {{/each}}
          </tbody>
        </table>
      </div>
    {{else}}
      <LoadingSpinner />
    {{/if}}

  </section>
</template>
