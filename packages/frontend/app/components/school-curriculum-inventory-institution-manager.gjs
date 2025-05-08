import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { dropTask } from 'ember-concurrency';
import { validatable, IsInt, Gte, Length, Lte, NotBlank } from 'ilios-common/decorators/validation';

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
}
