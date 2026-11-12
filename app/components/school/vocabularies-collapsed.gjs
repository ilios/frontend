import { on } from '@ember/modifier';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import Component from '@glimmer/component';
import { cached } from '@glimmer/tracking';
import { TrackedAsyncData } from 'ember-async-data';
import t from 'ember-intl/helpers/t';

import sortBy from '../../helpers/sort-by';
import LoadingSpinner from '../loading-spinner';

export default class SchoolVocabulariesCollapsedComponent extends Component {
  @cached
  get vocabulariesData() {
    return new TrackedAsyncData(this.args.school.vocabularies);
  }

  get vocabulariesLoading() {
    return !this.vocabulariesData.isResolved;
  }

  get vocabularies() {
    return this.vocabulariesData.isResolved ? this.vocabulariesData.value : [];
  }
  <template>
    <section
      class="school-vocabularies-collapsed"
      data-test-school-vocabularies-collapsed
      ...attributes
    >
      <div>
        <button
          class="title link-button"
          type="button"
          aria-expanded="false"
          data-test-title
          {{on "click" @expand}}
        >
          {{t "general.vocabularies"}}
          ({{this.vocabularies.length}})
          <FaIcon @icon={{faCaretRight}} />
        </button>
      </div>
      {{#if this.vocabulariesLoading}}
        <LoadingSpinner />
      {{else}}
        <div class="content">
          <table class="ilios-table ilios-table-colors condensed">
            <thead>
              <tr>
                <th class="text-left">
                  {{t "general.vocabulary"}}
                </th>
                <th class="text-left">
                  {{t "general.summary"}}
                </th>
              </tr>
            </thead>
            <tbody>
              {{#each (sortBy "title" this.vocabularies) as |vocabulary|}}
                <tr data-test-vocabulary>
                  <td>
                    {{vocabulary.title}}
                  </td>
                  <td class="summary-highlight">
                    {{t "general.thereAreXTerms" count=vocabulary.termCount}}
                  </td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        </div>
      {{/if}}
    </section>
  </template>
}
