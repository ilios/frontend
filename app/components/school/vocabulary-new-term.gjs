import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from '../../classes/yup-validations';
import { string } from 'yup';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { uniqueId } from '@ember/helper';
import pick from '../../helpers/pick';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
import focus from '../../modifiers/focus';
import LoadingSpinner from '../loading-spinner';
import YupValidationMessage from '../yup-validation-message';
import ToggleYesno from '../toggle-yesno';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons';

export default class SchoolVocabularyNewTermComponent extends Component {
  @service store;
  @service intl;
  @tracked title;
  @tracked isActive = true;
  @tracked description = '';

  validations = new YupValidations(this, {
    title: string()
      .required()
      .max(200)
      .test(
        'is-title-unique',
        (d) => {
          return {
            path: d.path,
            messageKey: 'errors.exclusion',
          };
        },
        (value) => value == null || !this.existingTitles.includes(value),
      ),
  });

  @cached
  get termData() {
    return new TrackedAsyncData(
      this.args.term ? this.args.term.children : this.args.vocabulary.getTopLevelTerms(),
    );
  }

  get existingTitles() {
    return this.termData.isResolved ? this.termData.value.map(({ title }) => title) : [];
  }

  save = task({ drop: true }, async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    await this.args.createTerm(this.title, this.description, this.isActive);
    this.title = null;
    this.isActive = true;
    this.description = '';
  });

  saveOnEnter = task({ drop: true }, async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.save.perform();
    }
  });
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="school-vocabulary-new-term" data-test-school-vocabulary-new-term>
        <div class="header">
          <div class="title" data-test-vocabulary-new-term-title>
            <h3>
              {{#if @term}}
                {{t "general.newSubTerm"}}
              {{else}}
                {{t "general.newTerm"}}
              {{/if}}
            </h3>
          </div>

          <span class="actions">
            {{#if @canUpdate}}
              <button
                class="link-button edit-term{{if @showRemovalConfirmation ' disabled'}}"
                type="button"
                disabled={{@showRemovalConfirmation}}
                data-test-edit-term
                title={{if
                  @showRemovalConfirmation
                  (t "general.disabledByConfirmation")
                  (t "general.editTerm")
                }}
                {{on "click" @toggleEditTermForm}}
              >
                <FaIcon
                  @icon={{faPenToSquare}}
                  class={{if @showRemovalConfirmation "disabled" "enabled edit"}}
                />
              </button>
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
              placeholder={{t "general.vocabularyTermPlaceholder"}}
              disabled={{this.save.isRunning}}
              {{focus}}
              {{on "input" (pick "target.value" (set this "title"))}}
              {{on "keyup" (perform this.saveOnEnter)}}
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
              @toggle={{set this "isActive"}}
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
              {{on "input" (pick "target.value" (set this "description"))}}
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
                {{t "general.add"}}
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
