import Component from '@glimmer/component';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { task } from 'ember-concurrency';
import { findBy } from 'ilios-common/utils/array-helpers';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import isArray from 'ember-truth-helpers/helpers/is-array';
import sortBy from 'ilios-common/helpers/sort-by';
import eq from 'ember-truth-helpers/helpers/eq';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import perform from 'ember-concurrency/helpers/perform';

export default class NewSessionComponent extends Component {
  @service store;

  @tracked title;
  @tracked selectedSessionTypeId;

  validations = new YupValidations(this, {
    title: string().required().min(3).max(200),
  });

  get activeSessionTypes() {
    return this.args.sessionTypes.filter((sessionType) => sessionType.active);
  }

  get selectedSessionType() {
    let selectedSessionType;

    if (this.selectedSessionTypeId) {
      selectedSessionType = this.args.sessionTypes.find((sessionType) => {
        return Number(sessionType.id) === this.selectedSessionTypeId;
      });
    }

    if (!selectedSessionType) {
      // try and default to a type names 'Lecture';
      selectedSessionType = findBy(this.args.sessionTypes, 'title', 'Lecture');
    }

    if (!selectedSessionType) {
      selectedSessionType = this.args.sessionTypes[0];
    }

    return selectedSessionType;
  }

  saveNewSession = task({ drop: true }, async () => {
    this.validations.addErrorDisplayForAllFields();
    if (!(await this.validations.isValid())) {
      return false;
    }
    this.validations.clearErrorDisplay();
    const session = this.store.createRecord('session', {
      title: this.title,
      sessionType: this.selectedSessionType,
    });
    await this.args.save(session);
    this.args.cancel();
  });

  @action
  keyboard(event) {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      this.saveNewSession.perform();
      return;
    }

    if (27 === keyCode) {
      this.cancel();
    }
  }

  @action
  changeSelectedSessionTypeId(event) {
    this.selectedSessionTypeId = Number(event.target.value);
  }

  @action
  changeTitle(event) {
    this.title = event.target.value;
  }
  <template>
    <div class="new-session" data-test-new-session ...attributes>
      {{#let (uniqueId) as |templateId|}}
        <h4 class="new-session-title">{{t "general.newSession"}}</h4>
        <div class="new-session-content">
          <div class="item">
            <label for="title-{{templateId}}">
              {{t "general.title"}}:
            </label>
            <input
              id="title-{{templateId}}"
              type="text"
              value={{this.title}}
              placeholder={{t "general.sessionTitlePlaceholder"}}
              {{on "input" this.changeTitle}}
              {{on "keyup" this.keyboard}}
              {{this.validations.attach "title"}}
              class={{if this.validations.errors.title "has-error"}}
              disabled={{this.saveNewSession.isRunning}}
              data-test-title
            />
            <YupValidationMessage
              @description={{t "general.title"}}
              @validationErrors={{this.validations.errors.title}}
            />
          </div>
          <div class="item">
            <label for="session-type-{{templateId}}">
              {{t "general.sessionType"}}:
            </label>
            {{#if (isArray this.activeSessionTypes)}}
              <select
                id="session-type-{{templateId}}"
                data-test-session-types
                {{on "change" this.changeSelectedSessionTypeId}}
              >
                {{#each (sortBy "title" this.activeSessionTypes) as |sessionType|}}
                  <option
                    value={{sessionType.id}}
                    selected={{eq sessionType.id this.selectedSessionType.id}}
                    data-test-session-type
                  >
                    {{sessionType.title}}
                  </option>
                {{/each}}
              </select>
            {{else}}
              <LoadingSpinner />
            {{/if}}
          </div>
          <div class="buttons">
            <button
              class="done text"
              type="button"
              data-test-save
              {{on "click" (perform this.saveNewSession)}}
            >
              {{#if this.saveNewSession.isRunning}}
                <LoadingSpinner />
              {{else}}
                {{t "general.save"}}
              {{/if}}
            </button>
            <button class="cancel text" type="button" data-test-cancel {{on "click" @cancel}}>
              {{t "general.cancel"}}
            </button>
          </div>
        </div>
      {{/let}}
    </div>
  </template>
}
