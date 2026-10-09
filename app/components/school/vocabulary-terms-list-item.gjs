import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { guidFor } from '@ember/object/internals';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import mouseHoverToggle from '../../modifiers/mouse-hover-toggle';
import set from 'ember-set-helper/helpers/set';
import IliosTooltip from '../ilios-tooltip';
import VocabularyNewTerm from './vocabulary-new-term';
import VocabularyEditTerm from './vocabulary-edit-term';

export default class SchoolVocabularyTermsListItemComponent extends Component {
  @tracked isHovering;
  @tracked showAddSubTermForm = false;
  @tracked showEditTermForm = false;
  @tracked showRemovalConfirmation = false;

  get itemId() {
    return `school-vocabulary-terms-list-item-${guidFor(this)}`;
  }

  get itemElement() {
    return document.getElementById(this.itemId);
  }

  get showTooltip() {
    return this.args.term.description?.length && this.isHovering && !this.termSelected;
  }

  get level() {
    return this.args.level ?? 0;
  }

  get termSelected() {
    return this.showAddSubTermForm || this.showEditTermForm;
  }

  @action
  toggleAddSubTermForm() {
    this.showAddSubTermForm = !this.showAddSubTermForm;
    this.showEditTermForm = false;
    this.showRemovalConfirmation = false;
  }

  @action
  toggleEditTermForm() {
    this.showEditTermForm = !this.showEditTermForm;
    this.showAddSubTermForm = false;
    this.showRemovalConfirmation = false;
  }

  @action
  confirmRemoval() {
    this.showRemovalConfirmation = true;
    this.showAddSubTermForm = false;
    this.showEditTermForm = false;
  }

  @action
  cancelRemoval() {
    this.showRemovalConfirmation = false;
    this.showAddSubTermForm = false;
    this.showEditTermForm = true;
  }

  @action
  async deleteTerm() {
    await this.args.deleteTerm.perform(this.args.term);
  }

  @action
  cancelTermForms() {
    this.showAddSubTermForm = false;
    this.showEditTermForm = false;
  }

  @action
  click() {
    if (this.showAddSubTermForm || this.showEditTermForm) {
      this.showAddSubTermForm = false;
      this.showEditTermForm = false;
    } else {
      this.showEditTermForm = true;
    }
  }
  <template>
    {{#if @canUpdate}}
      <button
        type="button"
        class="school-vocabulary-terms-list-item school-vocabulary-terms-list-item-button{{if
            this.showRemovalConfirmation
            ' confirm-removal'
          }}{{if this.termSelected ' selected'}}"
        data-test-school-vocabulary-terms-list-item
        data-test-school-vocabulary-terms-list-item-level={{this.level}}
        id={{this.itemId}}
        {{on "click" this.click}}
        {{mouseHoverToggle (set this "isHovering")}}
      >
        {{#if this.showTooltip}}
          <IliosTooltip @target={{this.itemElement}}>
            {{@term.description}}
          </IliosTooltip>
        {{/if}}
        <span class="term-title">
          <span data-test-title>{{@term.title}}</span>
          {{#unless @term.active}}
            <span class="inactive" data-test-inactive>
              ({{t "general.inactive"}})
            </span>
          {{/unless}}
        </span>
      </button>

      {{#if this.showAddSubTermForm}}
        <VocabularyNewTerm
          @createTerm={{fn @createTerm @term}}
          @term={{@term}}
          @showEditTermForm={{this.showEditTermForm}}
          @toggleEditTermForm={{this.toggleEditTermForm}}
          @cancel={{this.cancelTermForms}}
          @canUpdate={{@canUpdate}}
        />
      {{/if}}
      {{#if this.showEditTermForm}}
        <VocabularyEditTerm
          @term={{@term}}
          @showAddSubTermForm={{this.showAddSubTermForm}}
          @toggleAddSubTermForm={{this.toggleAddSubTermForm}}
          @showRemovalConfirmation={{this.showRemovalConfirmation}}
          @termDeleteDisabled={{this.showRemovalConfirmation}}
          @confirmRemoval={{this.confirmRemoval}}
          @cancel={{this.cancelTermForms}}
          @canCreate={{@canCreate}}
          @canDelete={{@canDelete}}
        />
      {{/if}}
      {{#if this.showRemovalConfirmation}}
        <div class="confirm-message" data-test-confirm-removal>
          {{t "general.confirmRemoveTerm"}}
          <div class="confirm-buttons">
            <button
              type="button"
              class="remove text"
              data-test-confirm-removal-confirm
              {{on "click" this.deleteTerm}}
            >
              {{t "general.yes"}}
            </button>
            <button
              type="button"
              class="done text"
              data-test-confirm-removal-cancel
              {{on "click" this.cancelRemoval}}
            >
              {{t "general.cancel"}}
            </button>
          </div>
        </div>
      {{/if}}
    {{else}}
      <div
        class="school-vocabulary-terms-list-item{{if
            this.showRemovalConfirmation
            ' confirm-removal'
          }}"
        data-test-school-vocabulary-terms-list-item
        data-test-school-vocabulary-terms-list-item-level={{this.level}}
        id={{this.itemId}}
      >
        {{#if this.showTooltip}}
          <IliosTooltip @target={{this.itemElement}}>
            {{@term.description}}
          </IliosTooltip>
        {{/if}}
        <span class="term-title">
          <span data-test-title>{{@term.title}}</span>
          {{#unless @term.active}}
            <span class="inactive" data-test-inactive>
              ({{t "general.inactive"}})
            </span>
          {{/unless}}
        </span>
      </div>
    {{/if}}
  </template>
}
