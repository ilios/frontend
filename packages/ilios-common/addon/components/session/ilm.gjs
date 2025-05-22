import Component from '@glimmer/component';
import { cached, tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { guidFor } from '@ember/object/internals';
import { TrackedAsyncData } from 'ember-async-data';
import YupValidations from 'ilios-common/classes/yup-validations';
import { number } from 'yup';
import { dropTask, restartableTask } from 'ember-concurrency';
import { DateTime } from 'luxon';
import t from 'ember-intl/helpers/t';
import ToggleYesno from 'ilios-common/components/toggle-yesno';
import perform from 'ember-concurrency/helpers/perform';
import EditableField from 'ilios-common/components/editable-field';
import { on } from '@ember/modifier';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import SessionOverviewIlmDuedate from 'ilios-common/components/session-overview-ilm-duedate';

export default class SessionIlmComponent extends Component {
  @service store;
  @tracked localHours;

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

  saveIndependentLearning = dropTask(async (value) => {
    if (!value) {
      const ilmSession = await this.args.session.ilmSession;
      this.args.session.set('ilmSession', null);
      await ilmSession.destroyRecord();
      await this.args.session.save();
    } else {
      const hours = 1;
      const dueDate = DateTime.now().plus({ week: 6 }).set({ hour: 17, minute: 0 }).toJSDate();
      this.localHours = hours;
      const ilmSession = this.store.createRecord('ilm-session', {
        session: this.args.session,
        hours,
        dueDate,
      });
      this.args.session.set('ilmSession', await ilmSession.save());
      await this.args.session.save();
    }
  });

  changeIlmHours = restartableTask(async () => {
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
    <div class="session-ilm block" data-test-session-ilm>
      <label>{{t "general.independentLearning"}}:</label>
      <span class="ilm-value" data-test-ilm-value>
        {{#if @editable}}
          <ToggleYesno
            @yes={{this.isIndependentLearning}}
            @toggle={{perform this.saveIndependentLearning}}
            @disabled={{@session.ilmSession.content}}
            data-test-ilm-toggle
          />
        {{else}}
          {{#if this.isIndependentLearning}}
            <span class="add">{{t "general.yes"}}</span>
          {{else}}
            <span class="remove">{{t "general.no"}}</span>
          {{/if}}
        {{/if}}
      </span>
    </div>
    {{#if this.isIndependentLearning}}
      <div class="hours block" data-test-ilm-hours>
        <label for="hours-{{this.uniqueId}}">{{t "general.hours"}}:</label>
        <span>
          {{#if @editable}}
            <EditableField
              @value={{this.hours}}
              @save={{perform this.changeIlmHours}}
              @close={{this.resetHours}}
              @saveOnEnter={{true}}
              @closeOnEscape={{true}}
              as |isSaving|
            >
              <input
                id="hours-{{this.uniqueId}}"
                disabled={{isSaving}}
                type="text"
                value={{this.hours}}
                {{this.validations.attach "hours"}}
                {{on "input" (pick "target.value" (set this "localHours"))}}
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
        <SessionOverviewIlmDuedate
          @ilmSession={{this.ilmSession}}
          @editable={{@editable}}
          class="block"
        />
      {{/unless}}
    {{/if}}
  </template>
}
