import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import { filterBy, sortBy } from 'ilios-common/utils/array-helpers';
import t from 'ember-intl/helpers/t';
import { and, eq } from 'ember-truth-helpers';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import perform from 'ember-concurrency/helpers/perform';
import scrollIntoView from 'ilios-common/modifiers/scroll-into-view';
import { faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons';

export default class SchoolVocabulariesListComponent extends Component {
  @service store;
  @tracked newVocabulary;
  @tracked showRemovalConfirmationFor;

  scrollOpts = {
    behavior: 'smooth',
    block: 'nearest',
  };

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

  remove = task({ drop: true }, async (vocabulary) => {
    await vocabulary.destroyRecord();
    if (this.newVocabulary === vocabulary) {
      this.newVocabulary = null;
    }
  });
  <template>
    <div class="school-vocabularies-list" data-test-school-vocabularies-list ...attributes>
      <div class="school-vocabularies-list-list">
        {{#if this.sortedVocabularies.length}}
          <table class="ilios-table ilios-table-colors ilios-removable-table">
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
                      class="link-button{{if
                          (eq this.showRemovalConfirmationFor vocabulary)
                          ' disabled'
                        }}"
                      type="button"
                      title={{if
                        (eq this.showRemovalConfirmationFor vocabulary)
                        (t "general.disabledByConfirmation")
                        (t "general.edit")
                      }}
                      disabled={{eq this.showRemovalConfirmationFor vocabulary}}
                      data-test-manage
                      {{on "click" (fn @manageVocabulary vocabulary.id)}}
                    >
                      <FaIcon
                        @icon={{faPenToSquare}}
                        class={{if
                          (eq this.showRemovalConfirmationFor vocabulary)
                          "disabled"
                          "enabled"
                        }}
                      />
                    </button>
                    {{#if (and @canDelete (eq vocabulary.termCount 0))}}
                      <button
                        type="button"
                        class="link-button{{if
                            (eq this.showRemovalConfirmationFor vocabulary)
                            ' disabled'
                          }}"
                        title={{if
                          (eq this.showRemovalConfirmationFor vocabulary)
                          (t "general.disabledByConfirmation")
                          (t "general.remove")
                        }}
                        disabled={{eq this.showRemovalConfirmationFor vocabulary}}
                        {{on "click" (fn this.confirmRemoval vocabulary)}}
                        data-test-delete
                      >
                        <FaIcon
                          @icon={{faTrash}}
                          class={{if
                            (eq this.showRemovalConfirmationFor vocabulary)
                            "disabled"
                            "remove enabled"
                          }}
                        />
                      </button>
                    {{else}}
                      <button
                        type="button"
                        class="link-button disabled"
                        title={{t "general.canNotDeleteSchoolVocabulary"}}
                        disabled
                        data-test-delete
                      >
                        <FaIcon @icon={{faTrash}} class="disabled" />
                      </button>
                    {{/if}}
                  </td>
                </tr>
                {{#if (eq this.showRemovalConfirmationFor vocabulary)}}
                  <tr
                    class="confirm-removal"
                    {{scrollIntoView opts=this.scrollOpts}}
                    data-test-confirm-removal={{index}}
                  >
                    <td colspan="5">
                      <div class="confirm-message">
                        {{t "general.confirmRemoveVocabulary"}}
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
