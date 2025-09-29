import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { task } from 'ember-concurrency';
import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import noop from 'ilios-common/helpers/noop';
import YupValidations from 'ilios-common/classes/yup-validations';
import YupValidationMessage from 'ilios-common/components/yup-validation-message';
import { number, string } from 'yup';

export default class SchoolInstitutionalInformationManagerComponent extends Component {
  @service store;
  @tracked name = this.args.institutionalInformation?.name ?? '';
  @tracked aamcCode = this.args.institutionalInformation?.aamcCode ?? '';
  @tracked addressStreet = this.args.institutionalInformation?.addressStreet ?? '';
  @tracked addressCity = this.args.institutionalInformation?.addressCity ?? '';
  @tracked addressStateOrProvince =
    this.args.institutionalInformation?.addressStateOrProvince ?? '';
  @tracked addressZipCode = this.args.institutionalInformation?.addressZipCode ?? '';
  @tracked addressCountryCode = this.args.institutionalInformation?.addressCountryCode ?? '';

  validations = new YupValidations(this, {
    name: string().ensure().trim().min(1).max(100),
    aamcCode: number().integer().min(1),
    addressStreet: string().ensure().trim().min(1).max(100),
    addressCity: string().ensure().trim().min(1).max(100),
    addressStateOrProvince: string().ensure().trim().min(1).max(50),
    addressZipCode: string().ensure().trim().min(1).max(10),
    addressCountryCode: string().ensure().trim().min(1),
  });

  save = task({ drop: true }, async () => {
    this.validations.addErrorDisplayForAllFields();
    const isValid = await this.validations.isValid();
    if (!isValid) {
      return false;
    }
    this.validations.clearErrorDisplay();
    let institutionalInformation = this.args.institutionalInformation;
    if (!institutionalInformation) {
      institutionalInformation = this.store.createRecord('curriculum-inventory-institution');
    }
    institutionalInformation.set('name', this.name);
    institutionalInformation.set('aamcCode', this.aamcCode);
    institutionalInformation.set('addressStreet', this.addressStreet);
    institutionalInformation.set('addressCity', this.addressCity);
    institutionalInformation.set('addressStateOrProvince', this.addressStateOrProvince);
    institutionalInformation.set('addressZipCode', this.addressZipCode);
    institutionalInformation.set('addressCountryCode', this.addressCountryCode);
    await this.args.save(institutionalInformation);
  });

  saveOrCancel = task({ drop: true }, async (event) => {
    const keyCode = event.keyCode;
    if (13 === keyCode) {
      await this.save.perform();
    } else if (27 === keyCode) {
      this.args.manage(false);
    }
  });
  <template>
    {{#let (uniqueId) as |templateId|}}
      <div
        class="school-institutional-information-manager"
        data-test-school-institutional-information-manager
        ...attributes
      >
        <div
          data-test-school-institutional-information-manager-header
          class="school-institutional-information-manager-header"
        >
          <div class="title">
            {{t "general.institutionalInformation"}}
          </div>
          <div class="actions">
            {{#if @canUpdate}}
              <button
                type="button"
                class="bigadd"
                aria-label={{t "general.save"}}
                {{on "click" (perform this.save)}}
              >
                <FaIcon
                  @icon={{if this.save.isRunning "spinner" "check"}}
                  @spin={{this.save.isRunning}}
                />
              </button>
            {{/if}}
            <button
              type="button"
              class="bigcancel"
              aria-label={{t "general.cancel"}}
              {{on "click" (fn @manage false)}}
            >
              <FaIcon @icon="arrow-rotate-left" />
            </button>
          </div>
        </div>
        <div
          data-test-school-institutional-information-manager-content
          class="school-institutional-information-manager-content"
        >
          <div class="form">
            <div class="item" data-test-institution-name>
              <label for="name-{{templateId}}">
                {{t "general.schoolName"}}
              </label>
              <input
                id="name-{{templateId}}"
                type="text"
                value={{this.name}}
                {{on "input" (pick "target.value" (set this "name"))}}
                {{on "keyup" (if @institutionalInformation (perform this.saveOrCancel) (noop))}}
                {{this.validations.attach "name"}}
              />
              <YupValidationMessage
                @description={{t "general.schoolName"}}
                @validationErrors={{this.validations.errors.name}}
                data-test-institution-name-validation-error-message
              />
            </div>
            <div class="item" data-test-institution-aamc-code>
              <label for="aamc-id-{{templateId}}">
                {{t "general.aamcSchoolId"}}
              </label>
              <input
                id="aamc-id-{{templateId}}"
                type="text"
                maxlength="5"
                value={{this.aamcCode}}
                {{on "input" (pick "target.value" (set this "aamcCode"))}}
                {{on "keyup" (if @institutionalInformation (perform this.saveOrCancel) (noop))}}
                {{this.validations.attach "aamcCode"}}
              />
              <YupValidationMessage
                @description={{t "general.aamcSchoolId"}}
                @validationErrors={{this.validations.errors.aamcCode}}
                data-test-aamc-code-validation-error-message
              />
            </div>
            <div class="item" data-test-institution-address-street>
              <label for="street-{{templateId}}">
                {{t "general.street"}}
              </label>
              <input
                id="street-{{templateId}}"
                type="text"
                value={{this.addressStreet}}
                {{on "input" (pick "target.value" (set this "addressStreet"))}}
                {{on "keyup" (if @institutionalInformation (perform this.saveOrCancel) (noop))}}
                {{this.validations.attach "addressStreet"}}
              />
              <YupValidationMessage
                @description={{t "general.street"}}
                @validationErrors={{this.validations.errors.addressStreet}}
                data-test-address-street-validation-error-message
              />
            </div>
            <div class="item" data-test-institution-address-city>
              <label for="city-{{templateId}}">
                {{t "general.city"}}
              </label>
              <input
                id="city-{{templateId}}"
                type="text"
                value={{this.addressCity}}
                {{on "input" (pick "target.value" (set this "addressCity"))}}
                {{on "keyup" (if @institutionalInformation (perform this.saveOrCancel) (noop))}}
                {{this.validations.attach "addressCity"}}
              />
              <YupValidationMessage
                @description={{t "general.city"}}
                @validationErrors={{this.validations.errors.addressCity}}
                data-test-address-city-validation-error-message
              />
            </div>
            <div class="item" data-test-institution-address-state-or-province>
              <label for="state-{{templateId}}">
                {{t "general.stateOrProvince"}}
              </label>
              <input
                id="state-{{templateId}}"
                type="text"
                value={{this.addressStateOrProvince}}
                {{on "input" (pick "target.value" (set this "addressStateOrProvince"))}}
                {{on "keyup" (if @institutionalInformation (perform this.saveOrCancel) (noop))}}
                {{this.validations.attach "addressStateOrProvince"}}
              />
              <YupValidationMessage
                @description={{t "general.stateOrProvince"}}
                @validationErrors={{this.validations.errors.addressStateOrProvince}}
                data-test-address-state-or-province-validation-error-message
              />
            </div>
            <div class="item" data-test-institution-address-zip-code>
              <label for="zip-{{templateId}}">
                {{t "general.zipCode"}}
              </label>
              <input
                id="zip-{{templateId}}"
                type="text"
                value={{this.addressZipCode}}
                {{on "input" (pick "target.value" (set this "addressZipCode"))}}
                {{on "keyup" (if @institutionalInformation (perform this.saveOrCancel) (noop))}}
                {{this.validations.attach "addressZipCode"}}
              />
              <YupValidationMessage
                @description={{t "general.zipCode"}}
                @validationErrors={{this.validations.errors.addressZipCode}}
                data-test-address-zip-code-validation-error-message
              />
            </div>
            <div class="item" data-test-institution-address-country-code>
              <label for="country-{{templateId}}">
                {{t "general.countryCode"}}
              </label>
              <input
                id="country-{{templateId}}"
                type="text"
                maxlength="2"
                value={{this.addressCountryCode}}
                {{on "input" (pick "target.value" (set this "addressCountryCode"))}}
                {{on "keyup" (if @institutionalInformation (perform this.saveOrCancel) (noop))}}
                {{this.validations.attach "addressCountryCode"}}
              />
              <YupValidationMessage
                @description={{t "general.countryCode"}}
                @validationErrors={{this.validations.errors.addressCountryCode}}
                data-test-address-country-code-validation-error-message
              />
            </div>
          </div>
        </div>
      </div>
    {{/let}}
  </template>
}
