import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import YupValidations from 'ilios-common/classes/yup-validations';
import { string } from 'yup';
import { uniqueId } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import ExpandCollapseButton from 'ilios-common/components/expand-collapse-button';
import { on } from '@ember/modifier';
import focus from 'ilios-common/modifiers/focus';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import perform from 'ember-concurrency/helpers/perform';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import LoadingSpinner from 'ilios-common/components/loading-spinner';
import { LinkTo } from '@ember/routing';
import FaIcon from 'ilios-common/components/fa-icon';
import sortBy from 'ilios-common/helpers/sort-by';

export default class SchoolListComponent extends Component {
  @service currentUser;
  @service store;

  @tracked iliosAdministratorEmail;
  @tracked title;
  @tracked newSchool;
  @tracked isSavingNewSchool = false;
  @tracked showNewSchoolForm = false;

  validations = new YupValidations(this, {
    iliosAdministratorEmail: string().email().required().min(1).max(100),
    title: string().required().min(1).max(60),
  });

  @action
  toggleNewSchoolForm() {
    this.showNewSchoolForm = !this.showNewSchoolForm;
    this.newSchool = null;
    this.title = null;
    this.iliosAdministratorEmail = null;
  }

  @action
  closeNewSchoolForm() {
    this.showNewSchoolForm = false;
    this.title = null;
    this.iliosAdministratorEmail = null;
  }

  save = task({ drop: true }, async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    const newSchool = this.store.createRecord('school', {
      title: this.title,
      iliosAdministratorEmail: this.iliosAdministratorEmail,
    });
    this.newSchool = await newSchool.save();
    this.validations.clearErrorDisplay();
    this.title = null;
    this.iliosAdministratorEmail = null;
    this.showNewSchoolForm = false;
  });

  saveOrCancel = task({ drop: true }, async (event) => {
    const keyCode = event.keyCode;
    const target = event.target;

    if ('text' !== target.type) {
      return;
    }

    if (13 === keyCode) {
      await this.save.perform();
    } else if (27 === keyCode) {
      this.closeNewSchoolForm();
    }
  });
  <template>
    {{#let (uniqueId) as |templateId|}}
      <section class="school-list main-section" data-test-school-list ...attributes>
        <section class="schools">
          <div class="header">
            <h2 class="title">
              {{t "general.schools"}}
            </h2>
            {{#if this.currentUser.isRoot}}
              <div class="actions">
                <ExpandCollapseButton
                  @value={{this.showNewSchoolForm}}
                  @action={{this.toggleNewSchoolForm}}
                  @expandButtonLabel={{t "general.newSchool"}}
                  @collapseButtonLabel={{t "general.close"}}
                />
              </div>
            {{/if}}
          </div>
          {{#if this.showNewSchoolForm}}
            <section class="new" data-test-new-school-form>
              <div class="new-result-title">
                {{t "general.newSchool"}}
              </div>
              <div class="form">
                <div class="item" data-test-title>
                  <label for="title-{{templateId}}">
                    {{t "general.title"}}:
                  </label>
                  <input
                    id="title-{{templateId}}"
                    {{focus}}
                    type="text"
                    value={{this.title}}
                    placeholder={{t "general.schoolTitlePlaceholder"}}
                    {{on "input" (pick "target.value" (set this "title"))}}
                    {{on "keyup" (perform this.saveOrCancel)}}
                    {{this.validations.attach "title"}}
                  />
                  <YupValidationMessage
                    @description={{t "general.title"}}
                    @validationErrors={{this.validations.errors.title}}
                  />
                </div>
                <div class="item" data-test-email>
                  <label for="email-{{templateId}}">
                    {{t "general.administratorEmail"}}:
                  </label>
                  <input
                    id="email-{{templateId}}"
                    type="text"
                    value={{this.iliosAdministratorEmail}}
                    placeholder={{t "general.administratorEmailPlaceholder"}}
                    {{on "input" (pick "target.value" (set this "iliosAdministratorEmail"))}}
                    {{on "keyup" (perform this.saveOrCancel)}}
                    {{this.validations.attach "iliosAdministratorEmail"}}
                  />
                  <YupValidationMessage
                    @description={{t "general.administratorEmail"}}
                    @validationErrors={{this.validations.errors.iliosAdministratorEmail}}
                  />
                </div>
                <div class="buttons">
                  <button
                    type="button"
                    class="done text"
                    disabled={{this.save.isRunning}}
                    {{on "click" (perform this.save)}}
                    data-test-submit
                  >
                    {{#if this.save.isRunning}}
                      <LoadingSpinner />
                    {{else}}
                      {{t "general.done"}}
                    {{/if}}
                  </button>
                  <button
                    type="button"
                    class="cancel text"
                    {{on "click" this.closeNewSchoolForm}}
                    data-test-cancel
                  >
                    {{t "general.cancel"}}
                  </button>
                </div>
              </div>
            </section>
          {{/if}}
          {{#if this.newSchool}}
            <div class="savedschool" data-test-new-school>
              <LinkTo @route="school" @model={{this.newSchool}} data-test-link-to-new-school>
                <FaIcon @icon="square-up-right" />
                {{this.newSchool.title}}
              </LinkTo>
              {{t "general.savedSuccessfully"}}
            </div>
          {{/if}}
          <div class="list">
            {{#if @schools.length}}
              <table class="ilios-table ilios-zebra-table">
                <thead>
                  <tr>
                    <th class="text-left">
                      {{t "general.school"}}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {{#each (sortBy "title" @schools) as |school|}}
                    <tr data-test-school>
                      <td class="text-left" data-test-title>
                        <LinkTo @route="school" @model={{school}}>
                          {{school.title}}
                        </LinkTo>
                      </td>
                    </tr>
                  {{/each}}
                </tbody>
              </table>
            {{/if}}
          </div>
        </section>
      </section>
    {{/let}}
  </template>
}
