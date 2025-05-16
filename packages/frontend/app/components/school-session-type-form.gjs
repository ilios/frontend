import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { findById, sortBy } from 'ilios-common/utils/array-helpers';
import { uniqueId, concat } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
import not from 'ember-truth-helpers/helpers/not';
import sortBy0 from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import ToggleYesno from 'ilios-common/components/toggle-yesno';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';

export default class SchoolSessionTypeFormComponent extends Component {
  @service store;
  @service intl;

  @tracked assessment = this.args.assessment ?? false;
  @tracked calendarColor = this.args.calendarColor || null;
  @tracked isActive = this.args.isActive ?? true;
  @tracked selectedAamcMethodId = this.args.selectedAamcMethodId || null;
  @tracked selectedAssessmentOptionId = this.args.selectedAssessmentOptionId || null;
  @tracked title = this.args.title || '';

  validations = new YupValidations(this, {
    title: string().ensure().trim().required().max(100),
  });

  get assessmentOptions() {
    return this.store.peekAll('assessment-option');
  }

  get aamcMethods() {
    return this.store.peekAll('aamc-method');
  }

  get filteredAamcMethods() {
    return this.aamcMethods.filter(({ id, active }) => {
      if (id !== this.selectedAamcMethodId && !active) {
        return false;
      }
      if (this.assessment) {
        return id.startsWith('AM');
      } else {
        return id.startsWith('IM');
      }
    });
  }

  get selectedAamcMethod() {
    if (this.selectedAamcMethodId) {
      const selectedAamcMethod = findById(this.filteredAamcMethods, this.selectedAamcMethodId);
      return selectedAamcMethod ?? null;
    }
    return null;
  }

  get selectedAssessmentOption() {
    if (this.assessment) {
      const assessmentOption = this.selectedAssessmentOptionId
        ? findById(this.assessmentOptions, this.selectedAssessmentOptionId)
        : sortBy(this.assessmentOptions, 'name')[0];
      return assessmentOption ?? null;
    }
    return null;
  }

  @action
  updateAssessment(assessment) {
    this.selectedAamcMethodId = null;
    this.assessment = assessment;
  }

  saveSessionType = dropTask(async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    await this.args.save(
      this.title,
      this.calendarColor,
      this.assessment,
      this.selectedAssessmentOption,
      this.selectedAamcMethod,
      this.isActive,
    );
  });

  saveOrCancel = dropTask(async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.saveSessionType.perform();
      return;
    }
    if (27 === keyCode) {
      this.args.close();
    }
  });
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div class="school-session-type-form" data-test-school-session-type-form ...attributes>
        <div class="form">
          <div class="item" data-test-title>
            <label for="title-{{templateId}}">
              {{t "general.title"}}:
            </label>
            {{#if @canEditTitle}}
              <input
                id="title-{{templateId}}"
                type="text"
                value={{this.title}}
                placeholder={{t "general.sessionTypeTitlePlaceholder"}}
                {{on "input" (pick "target.value" (set this "title"))}}
                {{on "keyup" (perform this.saveOrCancel)}}
                {{this.validations.attach "title"}}
              />
              <YupValidationMessage
                @description={{t "general.title"}}
                @validationErrors={{this.validations.errors.title}}
                data-test-title-validation-error-message
              />
            {{else}}
              <span class="value">
                {{this.title}}
              </span>
            {{/if}}
          </div>
          <div class="item" data-test-aamc-method>
            <label for="aamc-method-{{templateId}}">
              {{t "general.aamcMethod"}}
            </label>
            {{#if @canEditAamcMethod}}
              <select
                id="aamc-method-{{templateId}}"
                {{on "change" (pick "target.value" (set this "selectedAamcMethodId"))}}
              >
                <option selected={{not this.selectedAamcMethodId}}></option>
                {{#each (sortBy0 "description" this.filteredAamcMethods) as |aamcMethod|}}
                  <option
                    value={{aamcMethod.id}}
                    selected={{eq aamcMethod.id this.selectedAamcMethodId}}
                  >
                    {{aamcMethod.description}}
                    {{#unless aamcMethod.active}}
                      ({{t "general.inactive"}})
                    {{/unless}}
                  </option>
                {{/each}}
              </select>
            {{else}}
              <span class="value">
                {{this.selectedAamcMethod.description}}
                {{#unless this.selectedAamcMethod.active}}
                  ({{t "general.inactive"}})
                {{/unless}}
              </span>
            {{/if}}
          </div>
          <div class="item calendar-color" data-test-color>
            <label for="color-{{templateId}}">
              {{t "general.color"}}:
            </label>
            {{#if @canEditCalendarColor}}
              <input
                id="color-{{templateId}}"
                type="color"
                value={{this.calendarColor}}
                {{on "input" (pick "target.value" (set this "calendarColor"))}}
                {{on "keyup" (perform this.saveOrCancel)}}
              />
            {{else}}
              <span class="value">
                {{! template-lint-disable no-inline-styles style-concatenation no-triple-curlies}}
                <span
                  class="box"
                  style={{{concat "background-color: " this.calendarColor}}}
                  data-test-colorbox
                ></span>
                {{this.calendarColor}}
              </span>
            {{/if}}
          </div>
          <div class="item" data-test-assessment>
            <label>
              {{t "general.assessment"}}:
            </label>
            {{#if @canEditAssessment}}
              <ToggleYesno @yes={{this.assessment}} @toggle={{this.updateAssessment}} />
            {{else}}
              <span class="value {{if this.assessment 'yes' 'no'}}">
                {{#if this.assessment}}
                  {{t "general.yes"}}
                {{else}}
                  {{t "general.no"}}
                {{/if}}
              </span>
            {{/if}}
          </div>
          {{#if this.assessment}}
            <div class="item" data-test-assessment-options>
              <label for="assessment-option-{{templateId}}">
                {{t "general.assessmentOption"}}:
              </label>
              {{#if @canEditAssessmentOption}}
                <select
                  id="assessment-option-{{templateId}}"
                  {{on "change" (pick "target.value" (set this "selectedAssessmentOptionId"))}}
                >
                  {{#each (sortBy0 "name" this.assessmentOptions) as |o|}}
                    <option value={{o.id}} selected={{eq o.id this.selectedAssessmentOptionId}}>
                      {{o.name}}
                    </option>
                  {{/each}}
                </select>
              {{else}}
                <span class="value">
                  {{this.selectedAssessmentOption.name}}
                </span>
              {{/if}}
            </div>
          {{/if}}
          <div class="item" data-test-active>
            <label>
              {{t "general.active"}}:
            </label>
            {{#if @canEditActive}}
              <ToggleYesno @yes={{this.isActive}} @toggle={{set this "isActive"}} />
            {{else}}
              <span class="value {{if this.isActive 'yes' 'no'}}">
                {{#if this.isActive}}
                  {{t "general.yes"}}
                {{else}}
                  {{t "general.no"}}
                {{/if}}
              </span>
            {{/if}}
          </div>
          <div class="buttons">
            {{#if @canUpdate}}
              <button
                type="button"
                class="done text"
                disabled={{this.saveSessionType.isRunning}}
                {{on "click" (perform this.saveSessionType)}}
                data-test-submit
              >
                {{#if this.saveSessionType.isRunning}}
                  <LoadingSpinner />
                {{else}}
                  {{t "general.done"}}
                {{/if}}
              </button>
              <button type="button" class="cancel text" {{on "click" @close}} data-test-cancel>
                {{t "general.cancel"}}
              </button>
            {{else}}
              <button type="button" class="text" {{on "click" @close}} data-test-close>
                {{t "general.close"}}
              </button>
            {{/if}}
          </div>
        </div>
      </div>
    {{/let}}
  </template>
}
