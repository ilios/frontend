import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { validatable, IsInt, Gte, Length, Lte, NotBlank } from 'ilios-common/decorators/validation';

@validatable
export default class SchoolCurriculumInventoryInstitutionManagerComponent extends Component {
  @service store;
  @tracked @Length(1, 100) @NotBlank() name;
  @tracked @IsInt() @Gte(1) @Lte(99999) aamcCode;
  @tracked @Length(1, 100) @NotBlank() addressStreet;
  @tracked @Length(1, 100) @NotBlank() addressCity;
  @tracked @Length(1, 50) @NotBlank() addressStateOrProvince;
  @tracked @Length(1, 10) @NotBlank() addressZipCode;
  @tracked @Length(1, 2) @NotBlank() addressCountryCode;

  @action
  load() {
    if (this.args.institution) {
      this.name = this.args.institution?.name;
      this.aamcCode = this.args.institution?.aamcCode;
      this.addressStreet = this.args.institution?.addressStreet;
      this.addressCity = this.args.institution?.addressCity;
      this.addressStateOrProvince = this.args.institution?.addressStateOrProvince;
      this.addressZipCode = this.args.institution?.addressZipCode;
      this.addressCountryCode = this.args.institution?.addressCountryCode;
    } else {
      this.name = '';
      this.aamcCode = '';
      this.addressStreet = '';
      this.addressCity = '';
      this.addressStateOrProvince = '';
      this.addressZipCode = '';
      this.addressCountryCode = '';
    }
  }

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
}
