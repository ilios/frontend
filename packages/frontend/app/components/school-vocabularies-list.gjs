import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { dropTask } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { filterBy, sortBy } from 'ilios-common/utils/array-helpers';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from 'ilios-common/components/fa-icon';
import and from 'ember-truth-helpers/helpers/and';
import notEq from 'ember-truth-helpers/helpers/not-eq';
import perform from 'ember-concurrency/helpers/perform';

export default class SchoolVocabulariesListComponent extends Component {
  @service store;
  @tracked newVocabulary;
  @tracked showRemovalConfirmationFor;

  @cached
  get vocabulariesData() {
    return new TrackedAsyncData(this.args.school.vocabularies);
  }

  get vocabularies() {
    return this.vocabulariesData.isResolved ? this.vocabulariesData.value : null;
  }

  get sortedVocabularies() {
    if (!this.vocabularies) {
      return [];
    }
    return sortBy(filterBy(this.vocabularies, 'isNew', false), 'title');
  }

  @action
  confirmRemoval(vocabulary) {
    this.showRemovalConfirmationFor = vocabulary;
  }

  @action
  cancelRemoval() {
    this.showRemovalConfirmationFor = null;
  }

  remove = dropTask(async (vocabulary) => {
    await vocabulary.destroyRecord();
    if (this.newVocabulary === vocabulary) {
      this.newVocabulary = null;
    }
  });
  <template>
    <div class="school-vocabularies-list" data-test-school-vocabularies-list ...attributes>
      <div class="school-vocabularies-list-list">
        {{#if this.sortedVocabularies.length}}
          <table>
            <thead>
              <tr>
                <th class="text-left" colspan="3">
                  {{t "general.vocabulary"}}
                </th>
                <th class="text-left" colspan="1">
                  {{t "general.terms"}}
                </th>
                <th class="text-left" colspan="1">
                  {{t "general.actions"}}
                </th>
              </tr>
            </thead>
            <tbody>
              {{#each this.sortedVocabularies as |vocabulary index|}}
                <tr
                  class={{if (eq this.showRemovalConfirmationFor vocabulary) "confirm-removal" ""}}
                  data-test-vocabulary={{index}}
                >
                  <td class="text-left text-top" colspan="3" data-test-title>
                    <button
                      class="link-button"
                      type="button"
                      {{on "click" (fn @manageVocabulary vocabulary.id)}}
                    >
                      {{vocabulary.title}}
                    </button>
                  </td>
                  <td class="text-left text-top" colspan="1" data-test-terms-count>
                    {{vocabulary.termCount}}
                  </td>
                  <td class="text-left text-top" colspan="1">
                    <button
                      class="link-button"
                      type="button"
                      aria-label={{t "general.edit"}}
                      data-test-manage
                      {{on "click" (fn @manageVocabulary vocabulary.id)}}
                    >
                      <FaIcon @icon="pen-to-square" class="enabled" />
                    </button>
                    {{#if
                      (and
                        @canDelete
                        (eq vocabulary.termCount 0)
                        (notEq this.showRemovalConfirmationFor vocabulary)
                      )
                    }}
                      <button
                        class="link-button"
                        type="button"
                        aria-label={{t "general.remove"}}
                        data-test-delete
                        {{on "click" (fn this.confirmRemoval vocabulary)}}
                      >
                        <FaIcon @icon="trash" class="enabled remove" />
                      </button>
                    {{else}}
                      <FaIcon @icon="trash" class="disabled" />
                    {{/if}}
                  </td>
                </tr>
                {{#if (eq this.showRemovalConfirmationFor vocabulary)}}
                  <tr class="confirm-removal" data-test-confirm-removal={{index}}>
                    <td colspan="5">
                      <div class="confirm-message">
                        {{t "general.confirmVocabularyRemoval"}}
                        <br />
                        <div class="confirm-buttons">
                          <button
                            type="button"
                            class="remove text"
                            data-test-submit-removal
                            {{on "click" (perform this.remove vocabulary)}}
                          >
                            {{t "general.yes"}}
                          </button>
                          <button
                            type="button"
                            class="done text"
                            data-test-cancel-removal
                            {{on "click" this.cancelRemoval}}
                          >
                            {{t "general.cancel"}}
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                {{/if}}
              {{/each}}
            </tbody>
          </table>
        {{/if}}
      </div>
    </div>
  </template>
}
