import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import { fn } from '@ember/helper';
<template>
  <div
    class="school-curriculum-inventory-institution-details"
    data-test-school-curriculum-inventory-institution-details
    ...attributes
  >
    <div
      data-test-school-curriculum-inventory-institution-details-header
      class="school-curriculum-inventory-institution-details-header"
    >
      <div class="title">
        {{t "general.curriculumInventoryInstitutionalInfo"}}
      </div>
      <div class="actions">
        {{#if @canUpdate}}
          <button type="button" {{on "click" (fn @manage true)}}>
            {{t "general.manageInstitutionalInfo"}}
          </button>
        {{/if}}
      </div>
    </div>
    <div
      data-test-school-curriculum-inventory-institution-details-content
      class="school-curriculum-inventory-institution-details-content"
    >
      {{#if @school.curriculumInventoryInstitution}}
        <div class="block" data-test-institution-name>
          <label>
            {{t "general.schoolName"}}:
          </label>
          <span>
            {{@school.curriculumInventoryInstitution.name}}
          </span>
        </div>
        <div class="block" data-test-institution-aamc-code>
          <label>
            {{t "general.aamcSchoolId"}}:
          </label>
          <span>
            {{@school.curriculumInventoryInstitution.aamcCode}}
          </span>
        </div>
        <div class="block" data-test-institution-address-street>
          <label>
            {{t "general.street"}}:
          </label>
          <span>
            {{@school.curriculumInventoryInstitution.addressStreet}}
          </span>
        </div>
        <div class="block" data-test-institution-address-city>
          <label>
            {{t "general.city"}}:
          </label>
          <span>
            {{@school.curriculumInventoryInstitution.addressCity}}
          </span>
        </div>
        <div class="block" data-test-institution-address-state-or-province>
          <label>
            {{t "general.stateOrProvince"}}:
          </label>
          <span>
            {{@school.curriculumInventoryInstitution.addressStateOrProvince}}
          </span>
        </div>
        <div class="block" data-test-institution-address-zip-code>
          <label>
            {{t "general.zipCode"}}:
          </label>
          <span>
            {{@school.curriculumInventoryInstitution.addressZipCode}}
          </span>
        </div>
        <div class="block" data-test-institution-address-country-code>
          <label>
            {{t "general.country"}}:
          </label>
          <span>
            {{@school.curriculumInventoryInstitution.addressCountryCode}}
          </span>
        </div>
      {{else}}
        <div class="block" data-test-institution-none-exists-message>
          {{t "general.noCurriculumInventoryInstitutionalInfo"}}
        </div>
      {{/if}}
    </div>
  </div>
</template>
