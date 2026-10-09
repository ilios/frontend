import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import YupValidations from '../../classes/yup-validations';
import { string } from 'yup';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { uniqueId } from '@ember/helper';
import { and, not } from 'ember-truth-helpers';
import pick from '../../helpers/pick';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
import focus from '../../modifiers/focus';
import LoadingSpinner from '../loading-spinner';
import YupValidationMessage from '../yup-validation-message';
import ToggleYesno from '../toggle-yesno';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';

export default class SchoolVocabularyEditTermComponent extends Component {
  @tracked titleBuffer;
  @tracked descriptionBuffer;
  @tracked isActiveBuffer;

  validations = new YupValidations(this, {
    title: string()
      .ensure()
      .trim()
      .required()
      .max(200)
      .test(
        'term-title-uniqueness',
        (d) => ({ path: d.path, messageKey: 'errors.exclusion' }),
        async (value) => {
          let terms;
          if (this.args.term.isTopLevel) {
            const vocab = await this.args.term.vocabulary;
            terms = await vocab.getTopLevelTerms();
          } else {
            const parent = await this.args.term.parent;
            terms = await parent.children;
          }
          return !terms.filter((term) => term.id !== this.args.term.id && term.title === value)
            .length;
        },
      ),
  });

  get title() {
    return this.titleBuffer ?? this.args.term.title;
  }

  get description() {
    return this.descriptionBuffer ?? this.args.term.description;
  }

  get isActive() {
    return this.isActiveBuffer ?? this.args.term.active;
  }

  save = task({ drop: true }, async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    this.args.term.title = this.title;
    this.args.term.active = this.isActive;
    this.args.term.description = this.description;
    await this.args.term.save();
    this.args.cancel();
  });

  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="school-vocabulary-edit-term" data-test-school-vocabulary-edit-term>
        <div class="header">
          <div class="title" data-test-vocabulary-edit-term-title>
            <h3>
              {{t "general.editTerm"}}
            </h3>
          </div>

          <span class="actions">
            {{#if @canCreate}}
              <button
                class="link-button add-button"
                type="button"
                data-test-add-sub-term
                title={{t "general.addSubTerm"}}
                {{on "click" @toggleAddSubTermForm}}
              >
                <FaIcon @icon={{faPlus}} class="enabled" />
              </button>
            {{/if}}
            {{#if @canDelete}}
              {{#if (and (not @term.hasChildren) (not @term.hasAssociations))}}
                <button
                  class="link-button delete-button{{if @termDeleteDisabled ' disabled'}}"
                  type="button"
                  disabled={{@termDeleteDisabled}}
                  data-test-delete
                  title={{if
                    @showRemovalConfirmation
                    (t "general.disabledByConfirmation")
                    (t "general.remove")
                  }}
                  {{on "click" @confirmRemoval}}
                >
                  <FaIcon
                    @icon={{faTrash}}
                    class={{if @termDeleteDisabled "disabled" "enabled remove"}}
                  />
                </button>
              {{else}}
                <button
                  type="button"
                  class="link-button delete-button disabled"
                  title={{t "general.canNotDeleteSchoolVocabularyTerm"}}
                  disabled
                  data-test-delete
                >
                  <FaIcon @icon={{faTrash}} class="disabled" />
                </button>
              {{/if}}
            {{/if}}
          </span>
        </div>

        <div class="form">
          <div class="item" data-test-vocabulary-term-title>
            <label for="title-{{templateId}}">
              {{t "general.title"}}:
            </label>
            <input
              id="title-{{templateId}}"
              type="text"
              value={{this.title}}
              disabled={{this.save.isRunning}}
              {{focus}}
              {{on "input" (pick "target.value" (set this "titleBuffer"))}}
              {{this.validations.attach "title"}}
            />
            <YupValidationMessage
              @description={{t "general.term"}}
              @validationErrors={{this.validations.errors.title}}
              data-test-title-validation-error-message
            />
          </div>

          <div class="item" data-test-vocabulary-term-is-active>
            <label>
              {{t "general.active"}}:
            </label>
            <ToggleYesno
              @yes={{this.isActive}}
              @toggle={{set this "isActiveBuffer"}}
              @disabled={{this.save.isRunning}}
            />
          </div>

          <div class="item" data-test-vocabulary-term-description>
            <label for="description-{{templateId}}">
              {{t "general.description"}}:
            </label>
            <textarea
              id="description-{{templateId}}"
              disabled={{this.save.isRunning}}
              {{on "input" (pick "target.value" (set this "descriptionBuffer"))}}
            >{{this.description}}</textarea>
          </div>

          <div class="buttons">
            <button
              type="button"
              class="done text"
              disabled={{this.save.isRunning}}
              data-test-submit
              {{on "click" (perform this.save)}}
            >
              {{#if this.save.isRunning}}
                <LoadingSpinner />
              {{else}}
                {{t "general.save"}}
              {{/if}}
            </button>
            <button type="button" class="cancel text" {{on "click" @cancel}} data-test-cancel>
              {{t "general.cancel"}}
            </button>
          </div>
        </div>
      </div>
    {{/let}}
  </template>
}
