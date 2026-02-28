import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { number } from 'yup';
import { task } from 'ember-concurrency';
import t from 'ember-intl/helpers/t';
import perform from 'ember-concurrency/helpers/perform';
import EditableField from 'ilios-common/components/editable-field';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import SessionOverviewIlmDuedate from 'ilios-common/components/session-overview-ilm-duedate';
import focus from 'ilios-common/modifiers/focus';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import { faPlus, faSpinner, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';
import { DateTime } from 'luxon';
import { and, not } from 'ember-truth-helpers';
import LoadingSpinner from 'ilios-common/components/loading-spinner';

export default class SessionIlmComponent extends Component {
  @service store;
  @tracked localHours;
  @tracked showRemoveConfirmation = false;

  get hours() {
    if (this.localHours !== undefined) {
      return this.localHours;
    }

    return this.ilmSession?.hours;
  }

  get uniqueId() {
    return guidFor(this);
  }

  validations = new YupValidations(this, {
    hours: number().required().moreThan(0),
  });

  @cached
  get ilmSessionData() {
    return new TrackedAsyncData(this.args.session.ilmSession);
  }

  get ilmSession() {
    return this.ilmSessionData.isResolved ? this.ilmSessionData.value : null;
  }

  get isIndependentLearning() {
    return this.ilmSession !== null;
  }

  addIlm = task({ drop: true }, async () => {
    const hours = 1;
    const dueDate = DateTime.now().plus({ week: 6 }).set({ hour: 17, minute: 0 }).toJSDate();
    this.localHours = hours;
    const ilmSession = this.store.createRecord('ilm-session', {
      session: this.args.session,
      hours,
      dueDate,
    });
    await ilmSession.save();
  });

  removeIlm = task({ drop: true }, async () => {
    const ilmSession = await this.args.session.ilmSession;
    this.args.session.set('ilmSession', null);
    await ilmSession.destroyRecord();
    await this.args.session.save();
    this.showRemoveConfirmation = false;
  });

  get status() {
    if (!this.isIndependentLearning && !this.args.editable) {
      return 'hidden';
    }

    if (this.showRemoveConfirmation) {
      return 'confirm-removal';
    }

    return this.isIndependentLearning ? 'is-ilm' : 'not-ilm';
  }

  changeIlmHours = task({ restartable: true }, async () => {
    this.validations.addErrorDisplayFor('hours');
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }

    this.validations.removeErrorDisplayFor('hours');
    const ilmSession = await this.args.session.ilmSession;
    if (ilmSession) {
      ilmSession.hours = this.hours;
      await ilmSession.save();
      this.resetHours();
    }
  });

  resetHours = () => {
    this.validations.removeErrorDisplayFor('hours');
    this.localHours = undefined;
  };

  <template>
    <fieldset class="session-ilm {{this.status}}" data-test-session-ilm>
      <legend>
        {{t "general.independentLearning"}}
        {{#if (and @editable this.isIndependentLearning)}}
          {{#if this.showRemoveConfirmation}}
            <button
              title={{t "general.cancel"}}
              type="button"
              {{on "click" (set this "showRemoveConfirmation" false)}}
              data-test-undo
            >
              <FaIcon @icon={{faUndo}} />
            </button>
          {{else}}
            <button
              title={{t "general.remove"}}
              type="button"
              {{on "click" (set this "showRemoveConfirmation" true)}}
              data-test-remove
            >
              <FaIcon
                @icon={{if this.removeIlm.isRunning faSpinner faTrash}}
                @spin={{this.removeIlm.isRunning}}
              />
            </button>
          {{/if}}
        {{/if}}
      </legend>
      {{#if this.showRemoveConfirmation}}
        <p data-test-confirmation-message>
          {{t "general.confirmRemoveIlm"}}
        </p>
        <div class="confirm-buttons">
          <button
            type="button"
            class="remove text"
            {{on "click" this.removeIlm.perform}}
            disabled={{this.removeIlm.isRunning}}
            data-test-confirm
          >
            {{#if this.removeIlm.isRunning}}
              <LoadingSpinner />
            {{else}}
              {{t "general.yes"}}
            {{/if}}
          </button>
          <button
            type="button"
            class="done text"
            {{on "click" (set this "showRemoveConfirmation" false)}}
            data-test-cancel
          >
            {{t "general.cancel"}}
          </button>
        </div>
      {{/if}}
      {{#if (and @editable (not this.showRemoveConfirmation))}}
        {{#unless this.isIndependentLearning}}
          <button
            title={{t "general.addIlm" session=@session.title}}
            type="button"
            class="add-ilm"
            {{on "click" this.addIlm.perform}}
            data-test-add
          >
            <FaIcon
              @icon={{if this.addIlm.isRunning faSpinner faPlus}}
              @spin={{this.addIlm.isRunning}}
            />
          </button>
        {{/unless}}
      {{/if}}
      {{#if (and @session.ilmSession (not this.showRemoveConfirmation))}}
        <div class="hours" data-test-ilm-hours>
          <label for="hours-{{this.uniqueId}}">{{t "general.hours"}}:</label>
          <span>
            {{#if @editable}}
              <EditableField
                @value={{this.hours}}
                @save={{perform this.changeIlmHours}}
                @close={{this.resetHours}}
                as |keyboard isSaving|
              >
                <input
                  id="hours-{{this.uniqueId}}"
                  disabled={{isSaving}}
                  type="text"
                  value={{this.hours}}
                  {{this.validations.attach "hours"}}
                  {{on "input" (pick "target.value" (set this "localHours"))}}
                  {{keyboard}}
                  {{focus}}
                />
                <YupValidationMessage
                  @description={{t "general.hours"}}
                  @validationErrors={{this.validations.errors.hours}}
                />
              </EditableField>
            {{else}}
              {{@session.ilmSession.hours}}
            {{/if}}
          </span>
        </div>
        {{#unless @session.hasPostrequisite}}
          <SessionOverviewIlmDuedate @ilmSession={{this.ilmSession}} @editable={{@editable}} />
        {{/unless}}
      {{/if}}
    </fieldset>
  </template>
}
