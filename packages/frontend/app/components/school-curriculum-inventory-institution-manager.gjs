import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { validatable, IsInt, Gte, Length, Lte, NotBlank } from 'ilios-common/decorators/validation';
import { uniqueId, fn } from '@ember/helper';
import t from 'ember-intl/helpers/t';
import { on } from '@ember/modifier';
import perform from 'ember-concurrency/helpers/perform';
import FaIcon from 'ilios-common/components/fa-icon';
import pick from 'ilios-common/helpers/pick';
import set from 'ember-set-helper/helpers/set';
import queue from 'ilios-common/helpers/queue';
import noop from 'ilios-common/helpers/noop';
import ValidationError from 'ilios-common/components/validation-error';

@validatable
export default class SchoolCurriculumInventoryInstitutionManagerComponent extends Component {
  @service store;
  @tracked @Length(1, 100) @NotBlank() name = this.args.institution?.name ?? '';
  @tracked @IsInt() @Gte(1) @Lte(99999) aamcCode = this.args.institution?.aamcCode ?? '';
  @tracked @Length(1, 100) @NotBlank() addressStreet = this.args.institution?.addressStreet ?? '';
  @tracked @Length(1, 100) @NotBlank() addressCity = this.args.institution?.addressCity ?? '';
  @tracked @Length(1, 50) @NotBlank() addressStateOrProvince =
    this.args.institution?.addressStateOrProvince ?? '';
  @tracked @Length(1, 10) @NotBlank() addressZipCode = this.args.institution?.addressZipCode ?? '';
  @tracked @Length(1, 2) @NotBlank() addressCountryCode =
    this.args.institution?.addressCountryCode ?? '';

  save = dropTask(async () => {
    this.addErrorDisplaysFor([
      'name',
      'aamcCode',
      'addressStreet',
      'addressCity',
      'addressStateOrProvince',
      'addressZipCode',
      'addressCountryCode',
    ]);
    const isValid = await this.isValid();
    if (!isValid) {
      return false;
    }

    let institution = this.args.institution;
    if (!institution) {
      institution = this.store.createRecord('curriculum-inventory-institution');
    }
    institution.set('name', this.name);
    institution.set('aamcCode', this.aamcCode);
    institution.set('addressStreet', this.addressStreet);
    institution.set('addressCity', this.addressCity);
    institution.set('addressStateOrProvince', this.addressStateOrProvince);
    institution.set('addressZipCode', this.addressZipCode);
    institution.set('addressCountryCode', this.addressCountryCode);
    await this.args.save(institution);
    this.clearErrorDisplay();
    this.args.manage(false);
  });

  saveOrCancel = dropTask(async (event) => {
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
        class="school-curriculum-inventory-institution-manager"
        data-test-school-curriculum-inventory-institution-manager
        ...attributes
      >
        <div
          data-test-school-curriculum-inventory-institution-manager-header
          class="school-curriculum-inventory-institution-manager-header"
        >
          <div class="title">
            {{t "general.curriculumInventoryInstitutionalInfo"}}
          </div>
          <div class="actions">
            {{#if @canUpdate}}
              <button type="button" class="bigadd" {{on "click" (perform this.save)}}>
                <FaIcon
                  @icon={{if this.save.isRunning "spinner" "check"}}
                  @spin={{this.save.isRunning}}
                />
              </button>
            {{/if}}
            <button type="button" class="bigcancel" {{on "click" (fn @manage false)}}>
              <FaIcon @icon="arrow-rotate-left" />
            </button>
          </div>
        </div>
        <div
          data-test-school-curriculum-inventory-institution-manager-content
          class="school-curriculum-inventory-institution-manager-content"
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
                {{on
                  "keyup"
                  (queue
                    (fn this.addErrorDisplayFor "name")
                    (if @institution (perform this.saveOrCancel) (noop))
                  )
                }}
              />
              <ValidationError @validatable={{this}} @property="name" />
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
                {{on
                  "keyup"
                  (queue
                    (fn this.addErrorDisplayFor "aamcCode")
                    (if @institution (perform this.saveOrCancel) (noop))
                  )
                }}
              />
              <ValidationError @validatable={{this}} @property="aamcCode" />
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
                {{on
                  "keyup"
                  (queue
                    (fn this.addErrorDisplayFor "addressStreet")
                    (if @institution (perform this.saveOrCancel) (noop))
                  )
                }}
              />
              <ValidationError @validatable={{this}} @property="addressStreet" />
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
                {{on
                  "keyup"
                  (queue
                    (fn this.addErrorDisplayFor "addressCity")
                    (if @institution (perform this.saveOrCancel) (noop))
                  )
                }}
              />
              <ValidationError @validatable={{this}} @property="addressCity" />
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
                {{on
                  "keyup"
                  (queue
                    (fn this.addErrorDisplayFor "addressStateOrProvince")
                    (if @institution (perform this.saveOrCancel) (noop))
                  )
                }}
              />
              <ValidationError @validatable={{this}} @property="addressStateOrProvince" />
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
                {{on
                  "keyup"
                  (queue
                    (fn this.addErrorDisplayFor "addressZipCode")
                    (if @institution (perform this.saveOrCancel) (noop))
                  )
                }}
              />
              <ValidationError @validatable={{this}} @property="addressZipCode" />
            </div>
            <div class="item" data-test-institution-address-country-code>
              <label for="country-{{templateId}}">
                {{t "general.country"}}
              </label>
              <input
                id="country-{{templateId}}"
                type="text"
                maxlength="2"
                value={{this.addressCountryCode}}
                {{on "input" (pick "target.value" (set this "addressCountryCode"))}}
                {{on
                  "keyup"
                  (queue
                    (fn this.addErrorDisplayFor "addressCountryCode")
                    (if @institution (perform this.saveOrCancel) (noop))
                  )
                }}
              />
              <ValidationError @validatable={{this}} @property="addressCountryCode" />
            </div>
          </div>
        </div>
      </div>
    {{/let}}
  </template>
}
