import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
<template>
  <div
    class="school-institutional-information-details"
    data-test-school-institutional-information-details
    ...attributes
  >
    <div
      data-test-school-institutional-information-details-header
      class="school-institutional-information-details-header"
    >
      <div class="title">
        {{t "general.institutionalInformation"}}
      </div>
      <div class="actions">
        {{#if @canUpdate}}
          <button type="button" {{on "click" (fn @manage true)}}>
            {{t "general.manageInstitutionalInformation"}}
          </button>
        {{/if}}
      </div>
    </div>
    <div
      data-test-school-institutional-information-details-content
      class="school-institutional-information-details-content"
    >
      {{#if @school.institutionalInformation}}
        <div class="block" data-test-institution-name>
          <label>
            {{t "general.schoolName"}}:
          </label>
          <span>
            {{@school.institutionalInformation.name}}
          </span>
        </div>
        <div class="block" data-test-institution-aamc-code>
          <label>
            {{t "general.aamcSchoolId"}}:
          </label>
          <span>
            {{@school.institutionalInformation.aamcCode}}
          </span>
        </div>
        <div class="block" data-test-institution-address-street>
          <label>
            {{t "general.street"}}:
          </label>
          <span>
            {{@school.institutionalInformation.addressStreet}}
          </span>
        </div>
        <div class="block" data-test-institution-address-city>
          <label>
            {{t "general.city"}}:
          </label>
          <span>
            {{@school.institutionalInformation.addressCity}}
          </span>
        </div>
        <div class="block" data-test-institution-address-state-or-province>
          <label>
            {{t "general.stateOrProvince"}}:
          </label>
          <span>
            {{@school.institutionalInformation.addressStateOrProvince}}
          </span>
        </div>
        <div class="block" data-test-institution-address-zip-code>
          <label>
            {{t "general.zipCode"}}:
          </label>
          <span>
            {{@school.institutionalInformation.addressZipCode}}
          </span>
        </div>
        <div class="block" data-test-institution-address-country-code>
          <label>
            {{t "general.country"}}:
          </label>
          <span>
            {{@school.institutionalInformation.addressCountryCode}}
          </span>
        </div>
      {{else}}
        <div class="block" data-test-institution-none-exists-message>
          {{t "general.noInstitutionalInformation"}}
        </div>
      {{/if}}
    </div>
  </div>
</template>
